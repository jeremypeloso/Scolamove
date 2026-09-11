// Génère les pages webp + manifest.json du catalogue interactif à partir du PDF.
// Usage : node scripts/build-catalogue.mjs
// Prérequis : npm i -D pdf-to-img sharp
import { pdf } from "pdf-to-img";
import sharp from "sharp";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const PDF_PATH = "public/catalogue/voyages-scolaires-2026-2027.pdf";
const OUT_DIR = "public/catalogue/pages";
const SCALE = 2; // 2 = bonne qualité zoom, 1.5 si le poids est trop lourd
const WEBP_QUALITY = 80;

await mkdir(OUT_DIR, { recursive: true });
for (const f of await readdir(OUT_DIR)) {
  if (f.endsWith(".webp")) await unlink(path.join(OUT_DIR, f));
}

const doc = await pdf(PDF_PATH, { scale: SCALE });
let n = 0;
let ratio = 0.7076;
for await (const png of doc) {
  n++;
  const img = sharp(png);
  if (n === 1) {
    const meta = await img.metadata();
    ratio = Number((meta.width / meta.height).toFixed(4));
  }
  await img.webp({ quality: WEBP_QUALITY }).toFile(path.join(OUT_DIR, `page-${String(n).padStart(2, "0")}.webp`));
  process.stdout.write(`\rPage ${n}/${doc.length}`);
}
await writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify({ totalPages: n, ratio }));
console.log(`\nOK : ${n} pages, ratio ${ratio}`);
