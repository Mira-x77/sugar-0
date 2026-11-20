import sharp from 'sharp';
const { data, info } = await sharp('extracted/stivia-broshure-p1.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, channels } = info;
for (const y of [700, 750, 800, 850, 900, 950, 1000]) {
  const runs = [];
  let inRun = false, start = 0;
  for (let x = 1600; x < 3780; x++) {
    const i = (y * width + x) * channels;
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    const dark = lum < 130;
    if (dark && !inRun) { inRun = true; start = x; }
    if (!dark && inRun) { inRun = false; if (x - start > 2) runs.push([start, x]); }
  }
  if (inRun) runs.push([start, 3780]);
  console.log('y', y, runs.slice(0, 12).map(r => r.join('-')).join('  '));
}
