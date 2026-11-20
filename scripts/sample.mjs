import sharp from 'sharp';

const { data, info } = await sharp('cvm.jpeg').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
console.log('size', width, height, channels);
for (const [x, y] of [[0,0],[10,10],[width-1,0],[0,height-1],[width-1,height-1],[Math.floor(width/2),5],[5,Math.floor(height/2)],[width-1,Math.floor(height/2)]]) {
  const i = (y * width + x) * channels;
  console.log(x, y, data[i], data[i+1], data[i+2], data[i+3]);
}
// print a row of luminance values at y=20
let row = [];
for (let x = 0; x < width; x += 40) {
  const i = (20 * width + x) * channels;
  row.push(`${x}:${data[i]},${data[i+1]},${data[i+2]}`);
}
console.log(row.join(' | '));
