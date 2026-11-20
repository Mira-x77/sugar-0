import sharp from 'sharp';
import fs from 'node:fs/promises';

await fs.mkdir('extracted/cuts', { recursive: true });

/**
 * Flood-fill the outside background to alpha 0.
 * `tolerance` is the max Euclidean distance allowed from the sampled
 * border colour. `feather` adds a soft edge to the matte.
 */
async function cutout(src, out, opts = {}) {
  const {
    tolerance = 46,
    feather = 2,
    crop = null,
    sampleBoxes = [[0, 0, 24, 24]],
    bgColors = null
  } = opts;

  const pipeline = sharp(src).ensureAlpha();
  if (crop) pipeline.extract(crop);
  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const outBuf = Buffer.from(data);

  // Sample background colours from known background patches.
  const samples = [];
  for (const [sx, sy, sw, sh] of sampleBoxes) {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = sy; y < sy + sh; y++) {
      for (let x = sx; x < sx + sw; x++) {
        const i = (y * width + x) * channels;
        r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
      }
    }
    samples.push([r / n, g / n, b / n]);
  }
  const colors = bgColors || samples;

  const dist = (i) => {
    let best = Infinity;
    for (const [r, g, b] of colors) {
      const dr = data[i] - r, dg = data[i + 1] - g, db = data[i + 2] - b;
      const d = dr * dr + dg * dg + db * db;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  };

  const visited = new Uint8Array(width * height);
  const stack = [];
  const push = (p) => {
    if (!visited[p]) stack.push(p);
  };
  for (let x = 0; x < width; x++) { push(x); push((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { push(y * width); push(y * width + width - 1); }

  while (stack.length) {
    const p = stack.pop();
    if (visited[p]) continue;
    visited[p] = 1;
    const i = p * channels;
    if (dist(i) > tolerance) continue;
    outBuf[i + 3] = 0;
    const x = p % width, y = (p / width) | 0;
    if (x > 0) push(p - 1);
    if (x < width - 1) push(p + 1);
    if (y > 0) push(p - width);
    if (y < height - 1) push(p + width);
  }

  // Soft matte: pixels touching transparency get partial alpha based on their
  // distance from the background colour.
  if (feather > 0) {
    const alpha = new Uint8Array(width * height);
    for (let p = 0; p < width * height; p++) alpha[p] = outBuf[p * channels + 3];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const p = y * width + x;
        if (alpha[p] === 0) continue;
        if (alpha[p - 1] !== 0 && alpha[p + 1] !== 0 && alpha[p - width] !== 0 && alpha[p + width] !== 0) continue;
        const i = p * channels;
        const edge = 1 - Math.min(1, (dist(i) - tolerance * 0.55) / (tolerance * 0.9));
        outBuf[i + 3] = Math.max(0, Math.min(outBuf[i + 3], Math.round(255 * (1 - edge * 0.65))));
      }
    }
  }

  const buf = await sharp(outBuf, { raw: { width, height, channels } })
    .trim({ threshold: 2 })
    .webp({ quality: 92, alphaQuality: 98, compressionLevel: 9 })
    .toBuffer();

  await fs.writeFile(out, buf);
  const meta = await sharp(buf).metadata();
  console.log(out, `${meta.width}x${meta.height}`, Math.round(buf.length / 1024) + 'kb');
  return buf;
}

/* Jar: beige studio backdrop above, green cloth below. */
const jarBuf = await cutout(
  'WhatsApp Image 2026-11-18 at 6.00.24 AM.jpeg',
  'public/assets/jar-cut.webp',
  {
    tolerance: 42,
    crop: { left: 0, top: 0, width: 921, height: 1090 },
    sampleBoxes: [[10, 10, 60, 60], [850, 10, 60, 60], [10, 500, 40, 100], [880, 500, 40, 100]]
  }
);

/* Drops: crop to the bottle and its gold dropper, then remove the pink set. */
const dropBuf = await cutout(
  'dfh.jpeg',
  'public/assets/drops-cut.webp',
  {
    tolerance: 40,
    crop: { left: 230, top: 55, width: 380, height: 900 },
    sampleBoxes: [[4, 4, 30, 30], [340, 4, 30, 30], [4, 860, 40, 30], [330, 860, 40, 30]]
  }
);

/* Preview both cutouts over the hero mint so we can judge the matte. */
const bg = Buffer.from(
  `<svg width="1000" height="720" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f5fdf8"/><stop offset="1" stop-color="#c8f6ea"/>
    </linearGradient></defs>
    <rect width="1000" height="720" fill="url(#g)"/>
  </svg>`
);
const jar = await sharp(jarBuf).resize({ height: 520 }).toBuffer();
const jarMeta = await sharp(jar).metadata();
const drop = await sharp(dropBuf).resize({ height: 330 }).toBuffer();
const dropMeta = await sharp(drop).metadata();

await sharp(bg)
  .composite([
    { input: jar, left: 250, top: 120 },
    { input: drop, left: 650, top: 250 }
  ])
  .png()
  .toFile('extracted/cuts/preview.png');
console.log('preview', jarMeta.width, dropMeta.width);
