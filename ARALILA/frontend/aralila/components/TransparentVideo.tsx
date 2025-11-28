"use client";

import React, { useRef, useEffect } from "react";

type Props = {
  src: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  keyColor?: string; // hex like #00ff00 or rgb(0,255,0)
  tolerance?: number; // distance tolerance (0-442). Larger = more removed
};

export default function TransparentVideo({
  src,
  className = "",
  width = "100%",
  height = "auto",
  keyColor = "#00ff00",
  tolerance = 160,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function parseColor(s: string) {
      if (!s) return [0, 255, 0];
      s = s.trim();
      if (s.startsWith("#")) {
        const hex = s.slice(1);
        if (hex.length === 3) {
          const r = parseInt(hex[0] + hex[0], 16);
          const g = parseInt(hex[1] + hex[1], 16);
          const b = parseInt(hex[2] + hex[2], 16);
          return [r, g, b];
        } else if (hex.length === 6) {
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          return [r, g, b];
        }
      }
      const m = s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
      if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
      return [0, 255, 0];
    }

    const target = parseColor(keyColor);
    const tolSq = tolerance * tolerance;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let mounted = true;
    video.play().catch(() => {});

    function frame() {
      if (!mounted) return;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      // draw at natural resolution for best chroma accuracy
      canvas.width = vw;
      canvas.height = vh;
      try {
        ctx.drawImage(video as CanvasImageSource, 0, 0, vw, vh);
        const img = ctx.getImageData(0, 0, vw, vh);
        const data = img.data;
        const tr = target[0], tg = target[1], tb = target[2];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dr = r - tr;
          const dg = g - tg;
          const db = b - tb;
          const distSq = dr * dr + dg * dg + db * db;
          if (distSq <= tolSq) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(img, 0, 0);
      } catch {
        // ignore
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src, keyColor, tolerance]);

  return (
    <div className={className} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <video
        ref={videoRef}
        src={src}
        crossOrigin="anonymous"
        style={{ display: "none" }}
        loop
        muted
        playsInline
      />
      <canvas ref={canvasRef} style={{ width, height, display: "block" }} />
    </div>
  );
}
