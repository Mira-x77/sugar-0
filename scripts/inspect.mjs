import sharp from 'sharp';

const { data, info } = await sharp('extracted/stivia-broshure-p1.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, channels } = info;
let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
for (let y = 600; y < 1150; y++) {
  for (let x = 1200; x < width; x++) {
    const i = (y * width + x) * channels;
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (lum < 150) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
}
console.log('logo bbox', minX, minY, maxX, maxY);

const s = await sharp('public/assets/sachet.png').stats();
console.log('sachet', s.channels.map(c => ({ min: c.min, max: c.max, mean: Math.round(c.mean) })));
const m = await sharp('public/assets/sachet.png').metadata();
console.log('sachet size', m.width, m.height, m.hasAlpha);
