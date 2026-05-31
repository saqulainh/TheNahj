import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import sharp from "sharp";
import { consumeRateLimit, getRequestClientIp } from "@/lib/rate-limit";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
const mediaDbPath = path.join(process.cwd(), "src", "data", "media-library.json");

interface MediaItem {
  id: string;
  title: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  storageProvider?: "local" | "supabase";
  storagePath?: string;
  variants?: Array<{ width: number; format: "webp"; url: string; fileName: string; storagePath: string }>;
  created_at: string;
}

const MEDIA_BUCKET = (process.env.SUPABASE_MEDIA_BUCKET || "media").trim().replace(/\/+$/, "");
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const IMAGE_WIDTHS = [480, 960, 1600];

async function ensureStorage() {
  // Safe-guard: do not write to local folder if on read-only serverless environment
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn("Could not create local uploads folder (read-only filesystem):", err);
  }
  try {
    await fs.access(mediaDbPath);
  } catch {
    try {
      await fs.writeFile(mediaDbPath, "[]", "utf8");
    } catch (err) {
      console.warn("Could not create local media-library.json:", err);
    }
  }
}

async function readMediaDb(): Promise<MediaItem[]> {
  let dbItems: MediaItem[] = [];
  // If Supabase is configured, read from media_items table
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        dbItems = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          fileName: item.file_name,
          url: item.url,
          mimeType: item.mime_type,
          size: item.size,
          storageProvider: item.storage_provider,
          storagePath: item.storage_path,
          variants: item.variants,
          created_at: item.created_at,
        }));
      } else if (error) {
        console.warn("Supabase media_items table read failed:", error.message);
      }
    } catch (err) {
      console.warn("Error reading Supabase media_items:", err);
    }
  }

  let localItems: MediaItem[] = [];
  try {
    await ensureStorage();
    const raw = await fs.readFile(mediaDbPath, "utf8");
    localItems = JSON.parse(raw) as MediaItem[];
  } catch {
    // Ignore if file doesn't exist or is invalid
  }

  // Merge items. Supabase items take precedence if there's an ID conflict.
  const map = new Map<string, MediaItem>();
  localItems.forEach((item) => map.set(item.id, item));
  dbItems.forEach((item) => map.set(item.id, item));
  
  return Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

async function writeMediaDb(items: MediaItem[]) {
  try {
    await ensureStorage();
    await fs.writeFile(mediaDbPath, JSON.stringify(items, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not write to local media database:", err);
  }
}

function sanitizeFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const base = path
    .basename(fileName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${Date.now()}-${base || "asset"}${ext}`;
}

function sanitizeTitle(rawTitle: string, fallback: string): string {
  const value = (rawTitle || fallback).replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return value.slice(0, 180) || fallback;
}

const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "audio/mpeg", "audio/mp4"];

function buildVariantName(baseFileName: string, width: number): string {
  const ext = path.extname(baseFileName);
  const stem = baseFileName.slice(0, baseFileName.length - ext.length);
  return `${stem}-w${width}.webp`;
}

async function generateImageVariants(buffer: Buffer, mimeType: string, safeName: string) {
  if (!mimeType.startsWith("image/")) return [] as Array<{ width: number; fileName: string; buffer: Buffer }>;
  const variants: Array<{ width: number; fileName: string; buffer: Buffer }> = [];
  try {
    for (const width of IMAGE_WIDTHS) {
      const output = await sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true, fit: "inside" })
        .webp({ quality: 78 })
        .toBuffer();
      variants.push({
        width,
        fileName: buildVariantName(safeName, width),
        buffer: output,
      });
    }
  } catch (err) {
    console.warn("Failed to generate image variants, resizing skipped:", err);
  }
  return variants;
}

export async function GET() {
  const items = await readMediaDb();
  return NextResponse.json(
    { items },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const clientKey = `media-write:${getRequestClientIp(request)}`;
    const limit = await consumeRateLimit({
      key: clientKey,
      limit: 20,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many uploads" },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSec),
          },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const title = String(formData.get("title") || "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Unsupported file type" },
        { status: 415 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: "File exceeds 10MB upload limit" },
        { status: 413 }
      );
    }

    const safeName = sanitizeFileName(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanTitle = sanitizeTitle(title, file.name);
    const generatedVariants = await generateImageVariants(buffer, file.type, safeName);

    if (isSupabaseConfigured && supabase) {
      const storagePath = `uploads/${safeName}`;
      const fileBlob = new Blob([new Uint8Array(buffer)], { type: file.type });
      
      // Upload raw file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(storagePath, fileBlob, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase Storage raw upload error:", uploadError);
        const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
        const maskedUrl = supabaseUrl ? `${supabaseUrl.substring(0, 15)}...${supabaseUrl.substring(supabaseUrl.length - 4)}` : "not configured";
        return NextResponse.json(
          { 
            success: false, 
            error: `Supabase Storage failed: ${uploadError.message}. (Bucket: '${MEDIA_BUCKET}', Path: '${storagePath}', Url: '${maskedUrl}'). Please verify your Vercel env variables.` 
          },
          { status: 500 }
        );
      }

      // Upload variants to Supabase storage
      const uploadedVariants: NonNullable<MediaItem["variants"]> = [];
      for (const variant of generatedVariants) {
        const variantStoragePath = `uploads/${variant.fileName}`;
        const variantBlob = new Blob([new Uint8Array(variant.buffer)], { type: "image/webp" });
        const { error: variantError } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(variantStoragePath, variantBlob, {
            contentType: "image/webp",
            upsert: false,
          });
        if (!variantError) {
          const { data: variantPublicData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(variantStoragePath);
          uploadedVariants.push({
            width: variant.width,
            format: "webp",
            url: variantPublicData.publicUrl,
            fileName: variant.fileName,
            storagePath: variantStoragePath,
          });
        }
      }

      const defaultImageUrl = uploadedVariants.find((v) => v.width === 960)?.url || uploadedVariants[0]?.url;
      const { data: publicData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
      
      const item: MediaItem = {
        id: randomUUID(),
        title: cleanTitle,
        fileName: safeName,
        url: defaultImageUrl || publicData.publicUrl,
        mimeType: file.type,
        size: file.size,
        storageProvider: "supabase",
        storagePath,
        variants: uploadedVariants,
        created_at: new Date().toISOString(),
      };

      // Save item to Supabase media_items table
      const { error: dbError } = await supabase
        .from("media_items")
        .insert({
          id: item.id,
          title: item.title,
          file_name: item.fileName,
          url: item.url,
          mime_type: item.mimeType,
          size: item.size,
          storage_provider: item.storageProvider,
          storage_path: item.storagePath,
          variants: item.variants,
          created_at: item.created_at,
        });

      if (dbError) {
        console.warn("Supabase media_items table save failed, falling back to local JSON:", dbError.message);
        // Fallback to local JSON save (will fail on Vercel, but safe locally)
        const all = await readMediaDb();
        all.unshift(item);
        await writeMediaDb(all);
      }

      return NextResponse.json(
        { success: true, item },
        {
          headers: {
            "X-RateLimit-Remaining": String(limit.remaining),
            "X-RateLimit-Backend": limit.backend,
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // ONLY RUN LOCAL FALLBACK IF SUPABASE IS NOT CONFIGURED
    await ensureStorage();
    const absolutePath = path.join(uploadsDir, safeName);
    await fs.writeFile(absolutePath, buffer);

    const localVariants: NonNullable<MediaItem["variants"]> = [];
    for (const variant of generatedVariants) {
      const variantPath = path.join(uploadsDir, variant.fileName);
      await fs.writeFile(variantPath, variant.buffer);
      localVariants.push({
        width: variant.width,
        format: "webp",
        url: `/uploads/${variant.fileName}`,
        fileName: variant.fileName,
        storagePath: `/uploads/${variant.fileName}`,
      });
    }

    const item: MediaItem = {
      id: randomUUID(),
      title: cleanTitle,
      fileName: safeName,
      url: localVariants.find((v) => v.width === 960)?.url || localVariants[0]?.url || `/uploads/${safeName}`,
      mimeType: file.type,
      size: file.size,
      storageProvider: "local",
      storagePath: `/uploads/${safeName}`,
      variants: localVariants,
      created_at: new Date().toISOString(),
    };

    const all = await readMediaDb();
    all.unshift(item);
    await writeMediaDb(all);

    return NextResponse.json(
      { success: true, item },
      {
        headers: {
          "X-RateLimit-Remaining": String(limit.remaining),
          "X-RateLimit-Backend": limit.backend,
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("CRITICAL: Media upload handler failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error in Media API",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const clientKey = `media-delete:${getRequestClientIp(request)}`;
  const limit = await consumeRateLimit({
    key: clientKey,
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many delete requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSec),
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }

  if (isSupabaseConfigured && supabase) {
    // Delete from Supabase media_items table
    const { data: itemData } = await supabase
      .from("media_items")
      .select("*")
      .eq("id", id)
      .single();

    if (itemData) {
      await supabase.from("media_items").delete().eq("id", id);
      const deletePaths = [itemData.storage_path, ...(itemData.variants?.map((v: any) => v.storagePath) || [])].filter(Boolean);
      await supabase.storage.from(MEDIA_BUCKET).remove(deletePaths).catch(() => undefined);
      return NextResponse.json({ success: true });
    }
  }

  const all = await readMediaDb();
  const target = all.find((item) => item.id === id);
  if (!target) {
    return NextResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
  }

  const next = all.filter((item) => item.id !== id);
  await writeMediaDb(next);

  if (target.storageProvider === "supabase" && isSupabaseConfigured && supabase) {
    const deletePaths = [target.storagePath, ...(target.variants?.map((v) => v.storagePath) || [])].filter(Boolean) as string[];
    if (deletePaths.length > 0) {
      await supabase.storage.from(MEDIA_BUCKET).remove(deletePaths).catch(() => undefined);
    }
  } else {
    try {
      await fs.unlink(path.join(uploadsDir, target.fileName));
    } catch {
      // Ignore missing files.
    }
    for (const variant of target.variants || []) {
      try {
        await fs.unlink(path.join(uploadsDir, variant.fileName));
      } catch {
        // Ignore missing files.
      }
    }
  }

  return NextResponse.json({ success: true });
}
