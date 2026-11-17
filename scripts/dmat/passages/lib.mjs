// Helpers shared by the passage files. Numbers in questions are always computed here or in the
// passage file, never typed in by hand.

/** A probability, rate or amount printed with a fixed number of decimals. */
export const fixed = (x, digits = 2) => (Math.round(x * 10 ** digits) / 10 ** digits).toFixed(digits);

/**
 * Four numeric options in ascending order. `right` is the computed answer; each wrong value comes
 * with the mistake that produces it. Throws if two options would print the same.
 */
export function numericOptions(right, wrong, format = fixed) {
  const options = [
    { value: right.value, text: format(right.value), correct: true, why: right.why },
    ...wrong.map((w) => ({ value: w.value, text: format(w.value), why: w.why })),
  ].sort((a, b) => a.value - b.value);
  if (new Set(options.map((o) => o.text)).size !== options.length) throw new Error(`Two options print the same: ${options.map((o) => o.text).join(', ')}`);
  return options.map(({ value, ...rest }) => rest);
}

/** Paragraphs are written as arrays of sentences so each stays readable in the source. */
export const p = (...sentences) => ({ type: 'p', text: sentences.join(' ') });

/** A whole number with thousands separators, as printed in the passages. */
export const whole = (x) => Math.round(x).toLocaleString('en-GB');

/** A signed decimal with a true minus sign. */
export const signed = (x, digits = 2) => (x < 0 ? `−${fixed(-x, digits)}` : fixed(x, digits));

/** A share of a whole printed as a percentage. */
export const percent = (x, digits = 1) => `${fixed(x * 100, digits)}%`;

const r1 = (n) => Math.round(n * 10) / 10;

/**
 * A line graph drawn as SVG: grid, tick labels, axis titles, and whatever `body` draws with the
 * two scale functions it is given. Every tick value and curve point is computed, not typed.
 *   x, y: { min, max, grid, label, title, format }
 */
export function graph({ id, w = 460, h = 300, left = 62, right = 22, top = 34, bottom = 52, x, y, body }) {
  const px = (v) => r1(left + ((v - x.min) / (x.max - x.min)) * (w - left - right));
  const py = (v) => r1(h - bottom - ((v - y.min) / (y.max - y.min)) * (h - top - bottom));
  const steps = (a) => Array.from({ length: Math.round((a.max - a.min) / a.grid) + 1 }, (_, i) => a.min + i * a.grid);
  const shows = (a, v) => { const k = (v - a.min) / a.label; return Math.abs(k - Math.round(k)) < 1e-9; };
  const fx = x.format ?? String;
  const fy = y.format ?? String;
  const grid = [
    ...steps(x).map((v) => `<line x1="${px(v)}" y1="${py(y.min)}" x2="${px(v)}" y2="${py(y.max)}"/>`),
    ...steps(y).map((v) => `<line x1="${px(x.min)}" y1="${py(v)}" x2="${px(x.max)}" y2="${py(v)}"/>`),
  ].join('');
  const labels = [
    ...steps(x).filter((v) => shows(x, v)).map((v) => `<text x="${px(v)}" y="${py(y.min) + 21}" text-anchor="middle">${fx(v)}</text>`),
    ...steps(y).filter((v) => shows(y, v)).map((v) => `<text x="${px(x.min) - 8}" y="${py(v) + 5}" text-anchor="end">${fy(v)}</text>`),
  ].join('');
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-alt">
  <g class="grid">${grid}</g>
  <g class="axis"><line x1="${px(x.min)}" y1="${py(y.min)}" x2="${px(x.max)}" y2="${py(y.min)}"/><line x1="${px(x.min)}" y1="${py(y.min)}" x2="${px(x.min)}" y2="${py(y.max)}"/></g>
  <g class="ticks">${labels}</g>
  <text class="title" x="${r1((px(x.min) + px(x.max)) / 2)}" y="${h - 8}" text-anchor="middle">${x.title}</text>
  <text class="title" x="6" y="${top - 16}">${y.title}</text>
  ${body({ px, py })}
</svg>`;
}

/** Points of a function, for a polyline. */
export const curve = (f, from, to, n, px, py) => Array.from({ length: n + 1 }, (_, i) => { const v = from + ((to - from) * i) / n; return `${px(v)},${py(f(v))}`; }).join(' ');
