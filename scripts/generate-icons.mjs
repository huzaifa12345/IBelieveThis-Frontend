/**
 * Generate favicon.ico, favicon-32x32.png, apple-touch-icon.png, og-image.jpg
 * from public/IBelieveThis.png (falls back to FaviconIBT.jfif).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const require = createRequire(import.meta.url);

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.warn('sharp not installed — run: npm i -D sharp');
    console.warn('Skipping icon generation.');
    process.exit(0);
  }

  const srcCandidates = ['IBelieveThis.png', 'FaviconIBT.jfif', 'og-image.jpg'];
  const srcName = srcCandidates.find((f) => fs.existsSync(path.join(publicDir, f)));
  if (!srcName) {
    console.warn('No source image found in public/');
    process.exit(0);
  }
  const src = path.join(publicDir, srcName);
  console.log('Source:', srcName);

  await sharp(src).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(src).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Multi-size ICO via png pack — sharp can write .ico on recent versions; else 32png copied
  try {
    await sharp(src)
      .resize(32, 32)
      .toFormat('png')
      .toFile(path.join(publicDir, 'favicon.ico'));
  } catch {
    fs.copyFileSync(path.join(publicDir, 'favicon-32x32.png'), path.join(publicDir, 'favicon.ico'));
  }

  await sharp(src)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(publicDir, 'og-image.jpg'));

  console.log('Wrote favicon-32x32.png, apple-touch-icon.png, favicon.ico, og-image.jpg');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
