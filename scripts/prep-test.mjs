import sharp from 'sharp';
import fs from 'node:fs/promises';

await fs.mkdir('public/assets', { recursive: true });

// ---- Logo crop from brochure page 1 ----
const p1 = 'extracted/stivia-broshure-p1.png';
await sharp(p1)
  .extract({ left: 2000, top: 690, width: 1740, height: 400 })
  .toFile('extracted/logo-test.png');

// ---- Cafe photo ----
await sharp(p1)
  .extract({ left: 1770, top: 0, width: 2010, height: 2834 })
  .resize({ width: 1400 })
  .jpeg({ quality: 88 })
  .toFile('extracted/cafe-test.jpg');

// ---- Sachet cutout (white background flood fill) ----
const src = 'WhatsApp Image 2026-11-18 at 5.49.51 AM.jpeg';
const { data, info } = await sharp(src).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const out = Buffer.from(data);
const visited = new Uint8Array(width * height);
const stack = [];
const isBg = (i) => {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  return min > 208 && max - min < 26; // near white / light neutral
};
for (let x = 0; x < width; x++) { stack.push(x, 0, x, height - 1); }
for (let y = 0; y < height; y++) { stack.push(0, y, width - 1, y); }
while (stack.length) {
  const y = stack.pop(); const x = stack.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const p = y * width + x;
  if (visited[p]) continue;
  const i = p * channels;
  if (!isBg(i)) continue;
  visited[p] = 1;
  out[i + 3] = 0;
  stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
}
// Feather edge: semi-transparent halo pixels become partial
for (let p = 0; p < width * height; p++) {
  if (out[p * channels + 3] === 0) continue;
  const i = p * channels;
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const min = Math.min(r, g, b);
  if (min > 225) out[i + 3] = Math.max(0, 255 - (min - 225) * 9);
}
await sharp(out, { raw: { width, height, channels } })
  .trim({ threshold: 1 })
  .resize({ height: 1400, fit: 'inside' })
  .png({ compressionLevel: 9 })
  .toFile('extracted/sachet-cutout-test.png');

console.log('done');
