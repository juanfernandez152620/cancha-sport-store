// Converts the downloaded Nike AR campaign images into right-sized WebP files.
//   node scripts/build-banners.mjs <folder with the downloaded originals>
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = process.argv[2];
const OUT = path.resolve(import.meta.dirname, '../public/banners');
fs.mkdirSync(OUT, { recursive: true });

// [source file, output name, widths]
const JOBS = [
  ['futbol-25.webp', 'hero-futbol', [1600, 900]],
  ['home-01.webp', 'hero-mujer', [1920, 900]],
  ['home-04.webp', 'hero-hombre', [1600, 900]],
  ['hombre-31.png', 'hero-running', [1920, 900]],
  ['home-06.webp', 'hero-training', [1600, 900]],
  ['futbol-24.webp', 'futbol-noche', [1200, 700]],
  ['futbol-26.webp', 'futbol-camiseta', [1200, 700]],
  ['futbol-27.webp', 'futbol-azul', [1200, 700]],
  ['futbol-28.webp', 'futbol-camisetas', [760]],
  ['futbol-29.webp', 'futbol-pelota', [760]],
  ['home-03.webp', 'mujer-rosa', [1200, 700]],
  ['home-05.webp', 'jordan', [1200, 700]],
  ['hombre-32.jpg', 'hombre-noche', [760]],
  ['hombre-33.jpg', 'hombre-abrigo', [760]],
  ['hombre-34.png', 'hombre-retrato-1', [820, 480]],
  ['hombre-35.png', 'hombre-retrato-2', [820, 480]],
  ['hombre-36.png', 'hombre-retrato-3', [820, 480]],
  ['home-21.jpg', 'hombre-retrato-4', [820, 480]],
  ['mujer-41.png', 'mujer-retrato-1', [820, 480]],
  ['mujer-42.png', 'mujer-retrato-2', [820, 480]],
  ['mujer-43.png', 'mujer-retrato-3', [820, 480]],
  ['home-22.jpg', 'mujer-retrato-4', [820, 480]],
  ['mujer-38.jpg', 'mujer-urbana', [760]],
  ['mujer-39.jpg', 'mujer-calle', [760]],
  ['running-44.png', 'running-1', [409]],
  ['running-45.png', 'running-2', [409]],
  ['running-46.png', 'running-3', [409]],
  ['training-49.jpg', 'training-1', [760]],
  ['training-50.jpg', 'training-2', [760]],
  ['training-51.jpg', 'training-3', [760]],
  ['training-52.jpg', 'training-4', [760]],
];

const manifest = {};
for (const [file, name, widths] of JOBS) {
  const input = path.join(SRC, file);
  const meta = await sharp(input).metadata();
  manifest[name] = { w: meta.width, h: meta.height, sizes: [] };
  for (const w of widths) {
    const width = Math.min(w, meta.width);
    const out = `${name}-${width}.webp`;
    await sharp(input).resize({ width }).webp({ quality: 72, effort: 5 }).toFile(path.join(OUT, out));
    manifest[name].sizes.push(width);
  }
}
fs.writeFileSync(path.resolve(import.meta.dirname, '../src/data/banners.json'), JSON.stringify(manifest, null, 2));
console.log(Object.keys(manifest).length, 'banners');
