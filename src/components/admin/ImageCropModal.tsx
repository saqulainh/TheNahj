"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Check, SkipForward } from "lucide-react";

interface ImageCropModalProps {
  /** The source URL of the image to crop */
  imageUrl: string;
  /** Locked aspect ratio (width / height). E.g. 16/9, 1, 3/4 */
  aspectRatio: number;
  /** Human-readable label shown in the modal header */
  label: string;
  /** Called with the cropped blob when the user confirms */
  onConfirm: (croppedBlob: Blob) => void;
  /** Called when the user wants to skip cropping and use the original */
  onSkip: () => void;
  /** Called when the user cancels entirely */
  onCancel: () => void;
}

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type DragMode = "move" | "nw" | "ne" | "sw" | "se" | null;

const HANDLE_SIZE = 12;
const MIN_CROP = 40;

export default function ImageCropModal({
  imageUrl,
  aspectRatio,
  label,
  onConfirm,
  onSkip,
  onCancel,
}: ImageCropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const dragStart = useRef({ mx: 0, my: 0, crop: { x: 0, y: 0, width: 0, height: 0 } });
  const [isExporting, setIsExporting] = useState(false);

  // Compute display size and initial crop when image loads
  const onImageLoad = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const containerWidth = container.clientWidth - 48; // padding
    const containerHeight = container.clientHeight - 200; // space for header/buttons
    const maxW = Math.min(containerWidth, 800);
    const maxH = Math.min(containerHeight, 600);

    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    const dw = Math.round(img.naturalWidth * scale);
    const dh = Math.round(img.naturalHeight * scale);
    setDisplaySize({ w: dw, h: dh });

    // Initial crop: largest centered rectangle with correct aspect ratio
    let cw: number, ch: number;
    if (dw / dh > aspectRatio) {
      ch = dh;
      cw = Math.round(ch * aspectRatio);
    } else {
      cw = dw;
      ch = Math.round(cw / aspectRatio);
    }
    cw = Math.min(cw, dw);
    ch = Math.min(ch, dh);

    setCrop({
      x: Math.round((dw - cw) / 2),
      y: Math.round((dh - ch) / 2),
      width: cw,
      height: ch,
    });

    setImgLoaded(true);
  }, [aspectRatio]);

  // Clamp crop within display bounds
  const clampCrop = useCallback(
    (c: CropRect): CropRect => {
      const w = Math.max(MIN_CROP, Math.min(c.width, displaySize.w));
      const h = Math.max(MIN_CROP, Math.min(c.height, displaySize.h));
      const x = Math.max(0, Math.min(c.x, displaySize.w - w));
      const y = Math.max(0, Math.min(c.y, displaySize.h - h));
      return { x, y, width: w, height: h };
    },
    [displaySize]
  );

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, mode: DragMode) => {
      e.preventDefault();
      e.stopPropagation();
      setDragMode(mode);
      dragStart.current = { mx: e.clientX, my: e.clientY, crop: { ...crop } };
    },
    [crop]
  );

  useEffect(() => {
    if (!dragMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      const orig = dragStart.current.crop;

      if (dragMode === "move") {
        setCrop(
          clampCrop({
            x: orig.x + dx,
            y: orig.y + dy,
            width: orig.width,
            height: orig.height,
          })
        );
      } else {
        // Corner resize with aspect ratio lock
        let newW = orig.width;
        let newH = orig.height;
        let newX = orig.x;
        let newY = orig.y;

        if (dragMode === "se") {
          newW = Math.max(MIN_CROP, orig.width + dx);
          newH = Math.round(newW / aspectRatio);
        } else if (dragMode === "sw") {
          newW = Math.max(MIN_CROP, orig.width - dx);
          newH = Math.round(newW / aspectRatio);
          newX = orig.x + orig.width - newW;
        } else if (dragMode === "ne") {
          newW = Math.max(MIN_CROP, orig.width + dx);
          newH = Math.round(newW / aspectRatio);
          newY = orig.y + orig.height - newH;
        } else if (dragMode === "nw") {
          newW = Math.max(MIN_CROP, orig.width - dx);
          newH = Math.round(newW / aspectRatio);
          newX = orig.x + orig.width - newW;
          newY = orig.y + orig.height - newH;
        }

        // Clamp to display bounds
        if (newX < 0) { newW += newX; newX = 0; newH = Math.round(newW / aspectRatio); }
        if (newY < 0) { newH += newY; newY = 0; newW = Math.round(newH * aspectRatio); }
        if (newX + newW > displaySize.w) { newW = displaySize.w - newX; newH = Math.round(newW / aspectRatio); }
        if (newY + newH > displaySize.h) { newH = displaySize.h - newY; newW = Math.round(newH * aspectRatio); }

        setCrop(clampCrop({ x: newX, y: newY, width: newW, height: newH }));
      }
    };

    const handleMouseUp = () => setDragMode(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragMode, aspectRatio, clampCrop, displaySize]);

  // Export cropped region
  const handleConfirm = useCallback(async () => {
    const img = imgRef.current;
    if (!img || !displaySize.w) return;

    setIsExporting(true);
    try {
      const scaleX = img.naturalWidth / displaySize.w;
      const scaleY = img.naturalHeight / displaySize.h;

      const srcX = Math.round(crop.x * scaleX);
      const srcY = Math.round(crop.y * scaleY);
      const srcW = Math.round(crop.width * scaleX);
      const srcH = Math.round(crop.height * scaleY);

      const canvas = document.createElement("canvas");
      canvas.width = srcW;
      canvas.height = srcH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.88)
      );
      if (blob) onConfirm(blob);
    } finally {
      setIsExporting(false);
    }
  }, [crop, displaySize, onConfirm]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const aspectLabel =
    aspectRatio === 16 / 9 ? "16:9" : aspectRatio === 1 ? "1:1" : aspectRatio === 3 / 4 ? "3:4" : `${aspectRatio.toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="relative flex flex-col items-center w-full max-w-[900px] max-h-[90vh] mx-4 rounded-2xl border border-border/30 bg-surface overflow-hidden"
      >
        {/* Header */}
        <div className="flex w-full items-center justify-between border-b border-border/20 px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Crop Image — {label}</h3>
            <p className="text-[11px] text-muted mt-0.5">
              Aspect ratio locked to <span className="text-gold font-medium">{aspectLabel}</span>. Drag to reposition, corners to resize.
            </p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-lg p-1.5 text-muted hover:text-foreground hover:bg-surface-elevated/40 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Canvas area */}
        <div className="relative flex items-center justify-center flex-1 w-full p-6 overflow-hidden select-none" style={{ minHeight: 300 }}>
          {/* Hidden image for loading */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Crop source"
            crossOrigin="anonymous"
            onLoad={onImageLoad}
            className="hidden"
          />

          {imgLoaded && (
            <div className="relative" style={{ width: displaySize.w, height: displaySize.h }}>
              {/* Full image (dimmed) */}
              <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover rounded-lg pointer-events-none"
                style={{ filter: "brightness(0.35)" }}
                draggable={false}
              />

              {/* Bright crop window */}
              <div
                className="absolute overflow-hidden rounded-sm border-2 border-white/80 shadow-lg"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.width,
                  height: crop.height,
                  cursor: "move",
                }}
                onMouseDown={(e) => handleMouseDown(e, "move")}
              >
                <img
                  src={imageUrl}
                  alt=""
                  className="pointer-events-none"
                  style={{
                    position: "absolute",
                    left: -crop.x,
                    top: -crop.y,
                    width: displaySize.w,
                    height: displaySize.h,
                  }}
                  draggable={false}
                />

                {/* Rule of thirds grid */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
                </div>
              </div>

              {/* Corner handles */}
              {(["nw", "ne", "sw", "se"] as const).map((corner) => {
                const isLeft = corner.includes("w");
                const isTop = corner.includes("n");
                return (
                  <div
                    key={corner}
                    className="absolute z-10 bg-white border-2 border-gold rounded-sm shadow-md"
                    style={{
                      width: HANDLE_SIZE,
                      height: HANDLE_SIZE,
                      left: (isLeft ? crop.x : crop.x + crop.width) - HANDLE_SIZE / 2,
                      top: (isTop ? crop.y : crop.y + crop.height) - HANDLE_SIZE / 2,
                      cursor: `${corner}-resize`,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, corner)}
                  />
                );
              })}

              {/* Dimension label */}
              <div
                className="absolute text-[10px] font-mono text-white/70 bg-black/50 px-2 py-0.5 rounded-md pointer-events-none"
                style={{
                  left: crop.x + crop.width / 2,
                  top: crop.y + crop.height + 8,
                  transform: "translateX(-50%)",
                }}
              >
                {Math.round(crop.width * (imgRef.current ? imgRef.current.naturalWidth / displaySize.w : 1))} × {Math.round(crop.height * (imgRef.current ? imgRef.current.naturalHeight / displaySize.h : 1))}
              </div>
            </div>
          )}

          {!imgLoaded && (
            <div className="flex flex-col items-center gap-2 text-muted">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold/40 border-t-gold" />
              <span className="text-xs">Loading image…</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex w-full items-center justify-between border-t border-border/20 px-6 py-4">
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center gap-2 rounded-xl border border-border/40 bg-surface px-4 py-2.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <SkipForward size={13} /> Skip Cropping
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isExporting || !imgLoaded}
            className="inline-flex items-center gap-2 rounded-xl bg-gold/20 px-5 py-2.5 text-xs font-semibold text-gold-light hover:bg-gold/30 disabled:opacity-50 transition-colors"
          >
            <Check size={13} /> {isExporting ? "Exporting…" : "Confirm Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
