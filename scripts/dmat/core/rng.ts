/** Seeded random numbers, so every generated set can be rebuilt from its seed. */
export type Rng = () => number;
export type Band = 'low' | 'medium' | 'high';
export const BANDS: readonly Band[] = ['low', 'medium', 'high'];

/** [from, to): a difficulty score range. */
export type Range = readonly [number, number];
export const within = (x: number, [lo, hi]: Range) => x >= lo && x < hi;

/**
 * Each band has a core range, matched to the official samples, and a stretch range one notch
 * beyond it. The official samples are few and g.a.s.t. warns the real test may be harder, so
 * about a quarter of each band is drawn from the stretch range.
 */
export interface BandRanges {
  core: Record<Band, Range>;
  stretch: Record<Band, Range>;
}

export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function int(rng: Rng, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

export function pick<T>(rng: Rng, xs: readonly T[]): T {
  return xs[Math.floor(rng() * xs.length)];
}

export function shuffle<T>(rng: Rng, xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function chance(rng: Rng, p: number): boolean {
  return rng() < p;
}
