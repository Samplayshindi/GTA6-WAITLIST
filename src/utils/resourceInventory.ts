import { SLIDESHOW_IMAGES } from '../components/AtmosphericBackground';
import { CHARACTERS_DATA } from '../data/charactersData';
import { GALLERY_IMAGES, GalleryImage } from '../data/galleryData';
import { INITIAL_NEWS_ARTICLES } from '../data/newsData';

export const CORE_ESSENTIAL_RESOURCES = [
  '/',
  '/index.html',
  '/gta-vi-logo.svg',
  '/favicon.svg',
  '/images/hero-4k.jpg',
  '/images/launch-trailer-4k.jpg',
  '/images/extended-look-4k.jpg',
  '/images/trailer-2-landscape.jpg',
  '/images/trailer-1-landscape.jpg',
];

export function getFullImageInventory(): string[] {
  const images = new Set<string>();

  // 1. Static Core Images & Trailers
  CORE_ESSENTIAL_RESOURCES.forEach((r) => {
    if (r.endsWith('.jpg') || r.endsWith('.png') || r.endsWith('.svg') || r.endsWith('.webp')) {
      images.add(r);
    }
  });

  // 2. Desktop & Mobile Background Slideshow Images
  SLIDESHOW_IMAGES.forEach((url) => images.add(url));

  // 3. All Character Profile & Gallery Images
  CHARACTERS_DATA.forEach((char) => {
    if (char.images) {
      char.images.forEach((img) => images.add(img));
    }
  });

  // 4. All 117+ Gallery Archive Images
  GALLERY_IMAGES.forEach((item: GalleryImage) => {
    if (item.url) images.add(item.url);
  });

  // 5. All Newswire Fallback Images
  INITIAL_NEWS_ARTICLES.forEach((article) => {
    if (article.thumbnailUrl) images.add(article.thumbnailUrl);
  });

  return Array.from(images);
}
