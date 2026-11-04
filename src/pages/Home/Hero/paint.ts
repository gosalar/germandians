/** Palette-knife brush used to scrape the cover off the hero painting. */

const DABS_PER_STEP = 5;
const SWEEP_OFFSETS = [0.02, 0.24];
const SWEEP_DURATION = 650;
const SWEEP_GAP = 140;
const SWEEP_DELAY = 250;

export const COVER_COLOR = '#f7f5ef';

function dab(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  for (let i = 0; i < DABS_PER_STEP; i++) {
    const oy = (Math.random() - 0.5) * size * 0.85;
    const ox = (Math.random() - 0.5) * size * 0.4;
    const rx = size * (0.35 + Math.random() * 0.45);
    const ry = size * (0.07 + Math.random() * 0.17);
    ctx.globalAlpha = 0.6 + Math.random() * 0.4;
    ctx.beginPath();
    ctx.ellipse(ox, oy, rx, ry, (Math.random() - 0.5) * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Erases the cover along a line, revealing the painting underneath. */
export function scrape(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, size: number) {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  const dx = x1 - x0;
  const dy = y1 - y0;
  const angle = Math.atan2(dy, dx);
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (size * 0.18)));
  for (let i = 1; i <= steps; i++) dab(ctx, x0 + (dx * i) / steps, y0 + (dy * i) / steps, angle, size);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

export function cover(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = COVER_COLOR;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Two diagonal strokes that scrape a first band of the painting back in after
 * a wipe. Returns a cancel function.
 */
export function autoSweep(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const size = Math.min(width, height) * 0.2;
  const point = (offset: number, t: number): [number, number] => [
    (-0.12 + 1.24 * t) * width,
    (0.72 + offset - 0.8 * t - 0.14 * Math.sin(Math.PI * t)) * height,
  ];
  const last = SWEEP_OFFSETS.map((offset) => point(offset, 0));
  const start = performance.now();
  let frame = 0;

  const step = (now: number) => {
    let done = true;
    SWEEP_OFFSETS.forEach((offset, k) => {
      const t = Math.min(1, Math.max(0, (now - start - SWEEP_DELAY - k * SWEEP_GAP) / SWEEP_DURATION));
      if (t < 1) done = false;
      if (t <= 0) return;
      const next = point(offset, 1 - Math.pow(1 - t, 2));
      scrape(ctx, last[k][0], last[k][1], next[0], next[1], size);
      last[k] = next;
    });
    if (!done) frame = requestAnimationFrame(step);
  };

  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}
