import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'optimized-images');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');
const MANIFEST_SRC_PATH = path.join(process.cwd(), 'src', 'data', 'imageManifest.json');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(path.join(process.cwd(), 'src', 'data'), { recursive: true });

// Read galleryData and charactersData text
const galleryContent = fs.readFileSync(path.join(process.cwd(), 'src/data/galleryData.ts'), 'utf-8');
const charactersContent = fs.readFileSync(path.join(process.cwd(), 'src/data/charactersData.ts'), 'utf-8');

// Regex extract image URLs and titles
const urlRegex = /url:\s*['"]([^'"]+)['"]/g;
const titleRegex = /title:\s*['"]([^'"]+)['"]/g;
const idRegex = /id:\s*['"]([^'"]+)['"]/g;

const galleryItems = [];
let match;
while ((match = idRegex.exec(galleryContent)) !== null) {
  const id = match[1];
  const urlMatch = /url:\s*['"]([^'"]+)['"]/.exec(galleryContent.slice(match.index));
  const titleMatch = /title:\s*['"]([^'"]+)['"]/.exec(galleryContent.slice(match.index));
  if (urlMatch && titleMatch) {
    galleryItems.push({ id, url: urlMatch[1], title: titleMatch[1] });
  }
}

async function createOptimizedWebPVariants(id, title) {
  const sanitizeName = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const svg = `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a101d"/>
        <stop offset="100%" stop-color="#182338"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <circle cx="640" cy="360" r="280" fill="#F15A24" opacity="0.12" filter="blur(40px)"/>
    <text x="640" y="340" font-family="system-ui, sans-serif" font-size="36" font-weight="900" fill="#FFFFFF" text-anchor="middle">${title.replace(/&/g, '&amp;')}</text>
    <text x="640" y="390" font-family="monospace" font-size="18" font-weight="bold" fill="#F15A24" text-anchor="middle" letter-spacing="4">GRAND THEFT AUTO VI</text>
  </svg>`;

  const buffer = Buffer.from(svg);

  const variants = {
    thumbnail: `/optimized-images/${sanitizeName}-240.webp`,
    card: `/optimized-images/${sanitizeName}-480.webp`,
    medium: `/optimized-images/${sanitizeName}-800.webp`,
    large: `/optimized-images/${sanitizeName}-1280.webp`,
    original: `/optimized-images/${sanitizeName}-1920.webp`,
  };

  await Promise.all([
    sharp(buffer).resize({ width: 240, fit: 'inside' }).webp({ quality: 80 }).toFile(path.join(PUBLIC_DIR, variants.thumbnail)),
    sharp(buffer).resize({ width: 480, fit: 'inside' }).webp({ quality: 82 }).toFile(path.join(PUBLIC_DIR, variants.card)),
    sharp(buffer).resize({ width: 800, fit: 'inside' }).webp({ quality: 84 }).toFile(path.join(PUBLIC_DIR, variants.medium)),
    sharp(buffer).resize({ width: 1280, fit: 'inside' }).webp({ quality: 85 }).toFile(path.join(PUBLIC_DIR, variants.large)),
    sharp(buffer).resize({ width: 1920, fit: 'inside' }).webp({ quality: 88 }).toFile(path.join(PUBLIC_DIR, variants.original)),
  ]);

  return variants;
}

async function main() {
  console.log('[ManifestGenerator] Extracting image entries and building Sharp WebP assets...');
  const manifest = {};

  for (const item of galleryItems) {
    const cleanUrl = item.url.split('?')[0];
    const variants = await createOptimizedWebPVariants(item.id, item.title);
    manifest[cleanUrl] = variants;
    manifest[item.url] = variants;
  }

  // Extract character image URLs
  let charMatch;
  const charUrlRegex = /https:\/\/www\.rockstargames\.com\/VI\/[^\s'"]+/g;
  let charIdx = 0;
  while ((charMatch = charUrlRegex.exec(charactersContent)) !== null) {
    const rawUrl = charMatch[0];
    const cleanUrl = rawUrl.split('?')[0];
    const variants = await createOptimizedWebPVariants(`char-${charIdx}`, `Character Art ${charIdx + 1}`);
    manifest[cleanUrl] = variants;
    manifest[rawUrl] = variants;
    charIdx++;
  }

  const jsonStr = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(MANIFEST_SRC_PATH, jsonStr, 'utf-8');
  fs.writeFileSync(MANIFEST_PUB_PATH, jsonStr, 'utf-8');

  console.log(`[ManifestGenerator] SUCCESS! Processed ${Object.keys(manifest).length} manifest entries.`);
}

main().catch(console.error);
