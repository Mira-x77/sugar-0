import fs from 'node:fs/promises';
import path from 'node:path';
import { pdf } from 'pdf-to-img';

const files = [
  'stivia broshure.pdf',
  'Sugar-0_Jar Sticker_editable.pdf',
];

await fs.mkdir('extracted', { recursive: true });

for (const file of files) {
  const base = path.basename(file, '.pdf').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  try {
    const doc = await pdf(file, { scale: 2 });
    let i = 0;
    for await (const page of doc) {
      i++;
      const out = `extracted/${base}-p${i}.png`;
      await fs.writeFile(out, page);
      console.log(out, page.length);
    }
  } catch (err) {
    console.error('FAIL', file, err.message);
  }
}
