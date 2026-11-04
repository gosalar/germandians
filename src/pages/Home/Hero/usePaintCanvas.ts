import { useEffect, useRef, useState, type PointerEvent } from 'react';

import { prefersReducedMotion } from '@/utils/motion';

import { autoSweep, cover, scrape } from './paint';

const MAX_PIXEL_RATIO = 2;
const BRUSH_SCALE = 0.12;

interface Surface {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}

/**
 * Canvas laid over the hero painting. "Wipe" covers it, then the visitor
 * scrapes it back in with the pointer. Brush positions live in refs so
 * painting never re-renders React.
 */
export function usePaintCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surface = useRef<Surface | null>(null);
  const lastPoint = useRef<[number, number] | null>(null);
  const cancelSweep = useRef<() => void>(() => {});
  const [wiped, setWiped] = useState(false);

  /** Matches the canvas to its box. Resizing clears it, which un-wipes the painting. */
  const fitCanvas = () => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    if (!width || !height) return null;
    const current = surface.current;
    if (current && current.width === width && current.height === height) return current;

    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    cancelSweep.current();
    surface.current = { ctx, width, height };
    setWiped(false);
    return surface.current;
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(() => fitCanvas());
    observer.observe(wrap);
    return () => {
      observer.disconnect();
      cancelSweep.current();
    };
  }, []);

  const wipe = () => {
    const s = fitCanvas();
    if (!s) return;
    cancelSweep.current();
    cover(s.ctx, s.width, s.height);
    setWiped(true);
    if (!prefersReducedMotion()) cancelSweep.current = autoSweep(s.ctx, s.width, s.height);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const s = surface.current;
    const wrap = wrapRef.current;
    if (!wiped || !s || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const [fromX, fromY] = lastPoint.current ?? [x - 2, y + 1];
    scrape(s.ctx, fromX, fromY, x, y, Math.min(s.width, s.height) * BRUSH_SCALE);
    lastPoint.current = [x, y];
  };

  const onPointerLeave = () => {
    lastPoint.current = null;
  };

  return { wrapRef, canvasRef, wiped, wipe, onPointerMove, onPointerLeave };
}
