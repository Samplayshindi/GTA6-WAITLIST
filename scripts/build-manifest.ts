import fs from 'fs';
import path from 'path';
import { GALLERY_IMAGES } from '../src/data/galleryData';
import { CHARACTERS_DATA } from '../src/data/charactersData';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'optimized-images');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function normalizeUrl(url: string): string {
  if (!url) return '';
  return url.split('?')[0];
}

const manifest: Record<string, any> = {};

for (const item of GALLERY_IMAGES) {
  const sanitizeName = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanUrl = normalizeUrl(item.url);
  const entry = {
    thumbnail: `/optimized-images/${sanitizeName}-240.webp`,
    card: `/optimized-images/${sanitizeName}-480.webp`,
    medium: `/optimized-images/${sanitizeName}-800.webp`,
    large: `/optimized-images/${sanitizeName}-1280.webp`,
    original: `/optimized-images/${sanitizeName}-1920.webp`,
  };
  manifest[cleanUrl] = entry;
  manifest[item.url] = entry;
}

for (const char of CHARACTERS_DATA) {
  for (let i = 0; i < char.images.length; i++) {
    const rawUrl = char.images[i];
    const sanitizeName = `${char.id}-${i}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanUrl = normalizeUrl(rawUrl);
    const entry = {
      thumbnail: `/optimized-images/${sanitizeName}-240.webp`,
      card: `/optimized-images/${sanitizeName}-480.webp`,
      medium: `/optimized-images/${sanitizeName}-800.webp`,
      large: `/optimized-images/${sanitizeName}-1280.webp`,
      original: `/optimized-images/${sanitizeName}-1920.webp`,
    };
    manifest[cleanUrl] = entry;
    manifest[rawUrl] = entry;
  }
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`[ManifestBuilder] Synchronously generated manifest.json with ${Object.keys(manifest).length} entries.`);
