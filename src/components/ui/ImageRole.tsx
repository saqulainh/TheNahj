"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

type Role = "hero" | "card" | "sidebar";

interface ImageRoleProps {
  src?: string | null;
  alt?: string;
  role?: Role;
  className?: string;
  focalPoint?: { x: number; y: number } | null; // values 0-100
}

export function ImageRole({ src, alt = "", role = "hero", className = "", focalPoint = null }: ImageRoleProps) {
  const missing = !src;

  // Decide sizes and object-fit defaults per role
  const roleDefaults: Record<Role, { aspect: string; sizes: string; priority?: boolean }> = {
    hero: { aspect: "16:9", sizes: "(max-width:640px) 100vw, (max-width:1024px) 1200px, 1600px", priority: true },
    card: { aspect: "1:1", sizes: "(max-width:640px) 50vw, 600px", priority: false },
    sidebar: { aspect: "3:4", sizes: "(max-width:640px) 100vw, 360px", priority: false },
  };

  const opts = roleDefaults[role];
  const objectPosition = focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : "center";

  // Try to fetch media metadata to use generated variants (client-only)
  const [variants, setVariants] = useState<null | Array<{ width: number; url: string }>>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchMetadata() {
      try {
        const res = await fetch("/api/media");
        if (!res.ok) return;
        const json = await res.json();
        const items = json.items || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const match = items.find((it: any) => it.url === src || (it.variants || []).some((v: any) => v.url === src));
        if (match && !cancelled) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const vs = (match.variants || []).map((v: any) => ({ width: v.width, url: v.url }));
          if (vs.length) setVariants(vs);
        }
      } catch (err) {
        // ignore
      }
    }
    fetchMetadata();
    return () => { cancelled = true; };
  }, [src]);

  if (missing) {
    return <div className={`bg-muted ${className}`} style={{ minHeight: role === "hero" ? 220 : 120 }} />;
  }

  // If variants are available, render a native img with srcset for responsive delivery
  if (variants && variants.length > 0) {
    const srcset = variants.map((v) => `${v.url} ${v.width}w`).join(", ");
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: opts.aspect }}>
        <img
          src={variants[variants.length - 1].url}
          srcSet={srcset}
          sizes={opts.sizes}
          alt={alt}
          loading={opts.priority ? "eager" : "lazy"}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition }}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: opts.aspect }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={opts.sizes}
        style={{ objectFit: "cover", objectPosition }}
        priority={!!opts.priority}
      />
    </div>
  );
}

export default ImageRole;
