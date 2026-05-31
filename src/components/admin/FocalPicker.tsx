"use client";

import React, { useRef, useState, useEffect } from "react";

export default function FocalPicker({ src, value, onChange }: {
  src?: string | null;
  value?: { x: number; y: number } | null;
  onChange: (p: { x: number; y: number } | null) => void;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(value ?? null);

  useEffect(() => setPos(value ?? null), [value]);

  function handleClick(e: React.MouseEvent) {
    if (!imgRef.current || !wrapperRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clamped = { x: Math.max(0, Math.min(100, Math.round(x))), y: Math.max(0, Math.min(100, Math.round(y))) };
    setPos(clamped);
    onChange(clamped);
  }

  if (!src) return null;

  return (
    <div className="mt-2">
      <div ref={wrapperRef} className="relative w-full overflow-hidden rounded-lg border border-border/20" style={{ height: 160 }}>
        <img ref={imgRef} src={src} alt="Focal preview" onClick={handleClick} className="h-full w-full object-cover cursor-crosshair" />
        {pos && (
          <div style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className="pointer-events-none absolute translate-x-[-50%] translate-y-[-50%] flex items-center justify-center">
            <div className="h-7 w-7 rounded-full border-2 border-white bg-black/40 shadow-md" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted">
        <div>Focal: {pos ? `${pos.x}% ${pos.y}%` : "not set"}</div>
        <button type="button" onClick={() => { setPos(null); onChange(null); }} className="text-red-500">Clear</button>
      </div>
    </div>
  );
}
