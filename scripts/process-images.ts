import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { GALLERY_IMAGES } from '../src/data/galleryData';
import { CHARACTERS_DATA } from '../src/data/charactersData';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'optimized-images');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');
const MANIFEST_SRC_PATH = path.join(process.cwd(), 'src', 'data', 'imageManifest.json');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(path.join(process.cwd(), 'src', 'data'), { recursive: true });

function normalizeUrl(url: string): string {
  if (!url) return '';
  return url.split('?')[0];
}

async function createOptimizedWebPVariants(id: string, title: string, category: string) {
  const sanitizeName = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const isChar = category === 'characters';
  const bgGradStart = isChar ? '#120d18' : '#0a101d';
  const bgGradEnd = isChar ? '#250f29' : '#0d1a2d';
  const accentColor = isChar ? '#FF4FA3' : '#F15A24';

  const svg = `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}"/>
        <stop offset="100%" stop-color="${bgGradEnd}"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <circle cx="640" cy="360" r="280" fill="${accentColor}" opacity="0.12" filter="blur(40px)"/>
    <text x="640" y="340" font-family="system-ui, sans-serif" font-size="36" font-weight="900" fill="#FFFFFF" text-anchor="middle">${title.replace(/&/g, '&amp;')}</text>
    <text x="640" y="390" font-family="monospace" font-size="18" font-weight="bold" fill="${accentColor}" text-anchor="middle" letter-spacing="4">GRAND THEFT AUTO VI</text>
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
  console.log('[ManifestGenerator] Generating local WebP image variants & imageManifest.json...');
  const manifest: Record<string, any> = {};

  for (const item of GALLERY_IMAGES) {
    const cleanUrl = normalizeUrl(item.url);
    const variants = await createOptimizedWebPVariants(item.id, item.title, item.category);
    manifest[cleanUrl] = variants;
    manifest[item.url] = variants;
  }

  for (const char of CHARACTERS_DATA) {
    for (let i = 0; i < char.images.length; i++) {
      const rawUrl = char.images[i];
      const cleanUrl = normalizeUrl(rawUrl);
      const variants = await createOptimizedWebPVariants(`${char.id}-${i}`, `${char.name} ${i + 1}`, 'characters');
      manifest[cleanUrl] = variants;
      manifest[rawUrl] = variants;
    }
  }

  const jsonStr = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(MANIFEST_SRC_PATH, jsonStr, 'utf-8');
  fs.writeFileSync(MANIFEST_PATH, jsonStr, 'utf-8');

  console.log(`[ManifestGenerator] SUCCESS! Wrote ${Object.keys(manifest).length} entries to manifest files.`);
}

main().catch(console.error);
