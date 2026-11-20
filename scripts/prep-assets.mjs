import sharp from 'sharp';
import fs from 'node:fs/promises';

await fs.mkdir('public/assets', { recursive: true });

// ---------- Logo ----------
const logoCrop = await sharp('extracted/stivia-broshure-p1.png')
  .extract({ left: 1850, top: 660, width: 1900, height: 380 })
  .toBuffer();

const { data: ldata, info: linfo } = await sharp(logoCrop).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const lw = linfo.width, lh = linfo.height, lc = linfo.channels;
let bg = 0, n = 0;
for (let y = 0; y < 30; y++) for (let x = 0; x < 30; x++) {
  const i = (y * lw + x) * lc; bg += (ldata[i] + ldata[i + 1] + ldata[i + 2]) / 3; n++;
}
bg /= n;
console.log('logo bg', bg.toFixed(1));
const makeLogo = async (hex, file) => {
  const rgb = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const out = Buffer.alloc(lw * lh * 4);
  for (let p = 0; p < lw * lh; p++) {
    const i = p * lc;
    const lum = 0.2126 * ldata[i] + 0.7152 * ldata[i + 1] + 0.0722 * ldata[i + 2];
    let a = (bg - 8 - lum) / (bg - 95);
    a = Math.max(0, Math.min(1, a));
    a = Math.pow(a, 0.8);
    out[p * 4] = rgb[0]; out[p * 4 + 1] = rgb[1]; out[p * 4 + 2] = rgb[2];
    out[p * 4 + 3] = Math.round(a * 255);
  }
  await sharp(out, { raw: { width: lw, height: lh, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ width: 1500, fit: 'inside' })
    .png({ compressionLevel: 9 })
    .toFile(`public/assets/${file}`);
};
await makeLogo('#0b2a1e', 'logo.png');
await makeLogo('#f3ead4', 'logo-cream.png');
await makeLogo('#c9a25e', 'logo-gold.png');

// ---------- Photos ----------
await sharp('extracted/stivia-broshure-p1.png')
  .extract({ left: 1880, top: 1130, width: 1680, height: 1670 })
  .resize({ width: 1200 })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile('public/assets/cafe.jpg');

await sharp('WhatsApp Image 2026-11-18 at 6.00.24 AM.jpeg')
  .resize({ width: 1000 })
  .webp({ quality: 88 })
  .toFile('public/assets/jar.webp');

await sharp('WhatsApp Image 2026-11-18 at 6.00.23 AM.jpeg')
  .resize({ width: 1100 })
  .webp({ quality: 88 })
  .toFile('public/assets/sachets.webp');

await sharp('dfh.jpeg')
  .resize({ width: 1000 })
  .webp({ quality: 88 })
  .toFile('public/assets/drops.webp');

// ---------- Sachet cutout ----------
const { data, info } = await sharp('cvm.jpeg').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const out = Buffer.from(data);
const visited = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) { stack.push(x); stack.push((height - 1) * width + x); }
for (let y = 0; y < height; y++) { stack.push(y * width); stack.push(y * width + width - 1); }
while (stack.length) {
  const p = stack.pop();
  if (visited[p]) continue;
  visited[p] = 1;
  const i = p * channels;
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (!(min > 204 && max - min < 30)) continue;
  out[i + 3] = 0;
  const x = p % width, y = (p / width) | 0;
  if (x > 0) stack.push(p - 1);
  if (x < width - 1) stack.push(p + 1);
  if (y > 0) stack.push(p - width);
  if (y < height - 1) stack.push(p + width);
}
const alpha = new Uint8Array(width * height);
for (let p = 0; p < width * height; p++) alpha[p] = out[p * channels + 3];
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const p = y * width + x;
    if (alpha[p] === 0) continue;
    const i = p * channels;
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    if (min > 216 && (alpha[p - 1] === 0 || alpha[p + 1] === 0 || alpha[p - width] === 0 || alpha[p + width] === 0)) {
      out[i + 3] = Math.max(0, Math.round(255 - (min - 216) * 10));
    }
  }
}
await sharp(out, { raw: { width, height, channels } })
  .trim({ threshold: 2 })
  .resize({ height: 1400, fit: 'inside' })
  .webp({ quality: 88, alphaQuality: 95, compressionLevel: 9 })
  .toFile('public/assets/sachet.webp');

await sharp('public/assets/logo.png').resize({ width: 256 }).png().toFile('public/favicon.png');

const files = await fs.readdir('public/assets');
for (const f of files) {
  const s = await fs.stat(`public/assets/${f}`);
  console.log(f, Math.round(s.size / 1024) + 'kb');
}
