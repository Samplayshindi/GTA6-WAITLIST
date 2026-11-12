import manifestData from '../data/imageManifest.json';

interface ImageVariantMap {
  thumbnail: string;
  card: string;
  medium: string;
  large: string;
  original: string;
}

const manifest = manifestData as Record<string, ImageVariantMap>;

export function getOptimizedImageUrl(url: string, variant: 'thumbnail' | 'card' | 'medium' | 'large' | 'original' = 'card'): string {
  if (!url) return '/images/hero-4k.jpg';
  const cleanUrl = url.split('?')[0];
  const entry = manifest[cleanUrl] || manifest[url];

  if (entry && entry[variant]) {
    return entry[variant];
  }

  return url;
}

/**
 * Returns optimized local WebP image variant path matching target display width
 */
export function getResponsiveImageUrl(url: string, targetWidth: number): string {
  if (!url) return '/images/hero-4k.jpg';

  const cleanUrl = url.split('?')[0];
  const entry = manifest[cleanUrl] || manifest[url];

  if (entry) {
    if (targetWidth <= 280) return entry.thumbnail;
    if (targetWidth <= 520) return entry.card;
    if (targetWidth <= 850) return entry.medium;
    if (targetWidth <= 1350) return entry.large;
    return entry.original;
  }

  // Preserve external URL if not in manifest
  return url;
}

/**
 * Returns responsive srcset attribute string for optimized local WebP image variants
 */
export function getImageSrcSet(url: string): string {
  if (!url) return '';
  const cleanUrl = url.split('?')[0];
  const entry = manifest[cleanUrl] || manifest[url];

  if (entry) {
    return `${entry.thumbnail} 240w, ${entry.card} 480w, ${entry.medium} 800w, ${entry.large} 1280w, ${entry.original} 1920w`;
  }

  const w320 = getResponsiveImageUrl(url, 320);
  const w640 = getResponsiveImageUrl(url, 640);
  const w1080 = getResponsiveImageUrl(url, 1080);
  return `${w320} 320w, ${w640} 640w, ${w1080} 1080w`;
}
