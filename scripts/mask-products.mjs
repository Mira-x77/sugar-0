import sharp from 'sharp';
import fs from 'node:fs/promises';

await fs.mkdir('extracted/cuts', { recursive: true });

async function applyMask(src, out, { crop, width, height, svg, preview }) {
  const base = sharp(src).extract(crop).ensureAlpha();
  const mask = await sharp(Buffer.from(svg)).blur(1.4).png().toBuffer();

  const cut = await base
    .composite([{ input: mask, blend: 'dest-in' }])
    .trim({ threshold: 1 })
    .webp({ quality: 94, alphaQuality: 100, compressionLevel: 9 })
    .toBuffer();

  await fs.writeFile(out, cut);
  const meta = await sharp(cut).metadata();
  console.log(out, `${meta.width}x${meta.height}`, Math.round(cut.length / 1024) + 'kb');

  if (preview) {
    const bg = Buffer.from(
      `<svg width="900" height="700" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fbfffc"/><stop offset="1" stop-color="#c9f6ea"/>
        </linearGradient></defs>
        <rect width="900" height="700" fill="url(#g)"/>
      </svg>`
    );
    const img = await sharp(cut).resize({ height: 560 }).toBuffer();
    await sharp(bg).composite([{ input: img, left: 450 - Math.round((await sharp(img).metadata()).width / 2), top: 70 }]).png().toFile(preview);
  }
  return cut;
}

/* ---------------------------------------------------------------- jar */
const jarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="921" height="1090">
  <path fill="#fff" d="
    M 220 110
    Q 220 84 248 84
    L 690 84
    Q 718 84 718 110
    L 718 284
    L 746 318
    Q 762 336 762 362
    L 762 1002
    Q 762 1050 714 1050
    L 232 1050
    Q 184 1050 184 1002
    L 184 362
    Q 184 336 200 318
    L 228 284
    Z"/>
</svg>`;

await applyMask(
  'WhatsApp Image 2026-11-18 at 6.00.24 AM.jpeg',
  'public/assets/jar-cut.webp',
  {
    crop: { left: 0, top: 0, width: 921, height: 1090 },
    svg: jarSvg,
    preview: 'extracted/cuts/jar-preview.png'
  }
);

/* -------------------------------------------------------------- drops */
const dropSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <g fill="#fff">
    <rect x="455" y="92" width="120" height="120" rx="58"/>
    <rect x="398" y="198" width="242" height="106" rx="18"/>
    <rect x="436" y="286" width="166" height="48" rx="12"/>
    <path d="M 288 336
      L 812 336
      Q 840 336 842 380
      L 842 820
      Q 842 892 782 892
      L 318 892
      Q 258 892 258 820
      L 258 380
      Q 260 336 288 336 Z"/>
  </g>
</svg>`;

await applyMask(
  'dfh.jpeg',
  'public/assets/drops-cut.webp',
  {
    crop: { left: 0, top: 0, width: 1024, height: 1024 },
    svg: dropSvg,
    preview: 'extracted/cuts/drop-preview.png'
  }
);
