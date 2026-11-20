import sharp from 'sharp';

const crop = await sharp('extracted/stivia-broshure-p1.png')
  .extract({ left: 1810, top: 620, width: 1960, height: 600 })
  .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { data, info } = crop;
const { width, height, channels } = info;
let bg = 0, n = 0;
for (let y = 0; y < 30; y++) for (let x = 100; x < 140; x++) {
  const i = (y * width + x) * channels; bg += (data[i] + data[i + 1] + data[i + 2]) / 3; n++;
}
bg /= n;
console.log('bg', bg);
const makeLogo = async (hex, file) => {
  const rgb = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const out = Buffer.alloc(width * height * 4);
  for (let p = 0; p < width * height; p++) {
    const i = p * channels;
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    let a = (bg - 5 - lum) / (bg - 95);
    a = Math.max(0, Math.min(1, a));
    a = Math.pow(a, 0.85);
    out[p * 4] = rgb[0]; out[p * 4 + 1] = rgb[1]; out[p * 4 + 2] = rgb[2];
    out[p * 4 + 3] = Math.round(a * 255);
  }
  await sharp(out, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ width: 1600, fit: 'inside' })
    .png({ compressionLevel: 9 })
    .toFile(`public/assets/${file}`);
};
await makeLogo('#0b2a1e', 'logo.png');
await makeLogo('#f3ead4', 'logo-cream.png');
await makeLogo('#c9a25e', 'logo-gold.png');
await sharp('public/assets/logo.png').resize({ width: 256 }).png().toFile('public/favicon.png');
await sharp('public/assets/logo.png').flatten({ background: '#f7f2e7' }).png().toFile('extracted/logo-check2.png');
console.log('done');
