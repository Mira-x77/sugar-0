import sharp from 'sharp';

const { data, info } = await sharp('cvm.jpeg').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const out = Buffer.from(data);
const visited = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) { stack.push(x); stack.push((height - 1) * width + x); }
for (let y = 0; y < height; y++) { stack.push(y * width); stack.push(y * width + width - 1); }
let count = 0;
while (stack.length) {
  const p = stack.pop();
  if (visited[p]) continue;
  visited[p] = 1;
  const i = p * channels;
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (!(min > 204 && max - min < 30)) continue;
  out[i + 3] = 0;
  count++;
  const x = p % width, y = (p / width) | 0;
  if (x > 0) stack.push(p - 1);
  if (x < width - 1) stack.push(p + 1);
  if (y > 0) stack.push(p - width);
  if (y < height - 1) stack.push(p + width);
}
console.log('transparent', count, 'of', width * height);
await sharp(out, { raw: { width, height, channels } }).png().toFile('extracted/sachet-debug.png');
