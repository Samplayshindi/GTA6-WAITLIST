import { GALLERY_IMAGES } from '../data/galleryData';
import { getResponsiveImageUrl } from './imageUtils';

export const CORE_ESSENTIAL_RESOURCES: string[] = [
  '/gta-vi-logo.svg',
  '/favicon.svg',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/official-gta-vi-cover.png',
  '/official-gta-vi-hero.jpg',
  '/images/hero-4k.jpg',
  '/images/trailer-1-landscape.jpg',
  '/images/trailer-2-landscape.jpg',
];

export function getFullImageInventory(): string[] {
  const urls = GALLERY_IMAGES.map((item) => getResponsiveImageUrl(item.url, 480));
  return Array.from(new Set(urls));
}

const CACHE_NAME = 'gta-vi-site-files-v1';

export async function getCachedImageCount(): Promise<number> {
  if (typeof window === 'undefined' || !('caches' in window)) return 0;
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return keys.length;
  } catch {
    return 0;
  }
}

export async function cacheAllSiteImages(
  onProgress?: (current: number, total: number, percent: number) => void
): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  const inventory = getFullImageInventory();
  const cache = await caches.open(CACHE_NAME);

  let completed = 0;
  for (const url of inventory) {
    try {
      await cache.add(url);
    } catch {
      // Ignore individual resource failures
    }
    completed++;
    if (onProgress) {
      onProgress(completed, inventory.length, Math.round((completed / inventory.length) * 100));
    }
  }
}

export async function clearSiteImageCache(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    await caches.delete(CACHE_NAME);
  } catch {
    // Ignore error
  }
}
