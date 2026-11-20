import sharp from 'sharp';
import fs from 'node:fs/promises';

for (const f of ['extracted/stivia-broshure-p1.png', 'extracted/stivia-broshure-p3.png', 'extracted/stivia-broshure-p4.png', 'extracted/stivia-broshure-p5.png', 'cvm.jpeg', 'dfh.jpeg', 'WhatsApp Image 2026-11-18 at 5.49.51 AM.jpeg', 'WhatsApp Image 2026-11-18 at 6.00.23 AM.jpeg', 'WhatsApp Image 2026-11-18 at 6.08.30 AM.jpeg']) {
  const m = await sharp(f).metadata();
  console.log(f, m.width, m.height);
}
