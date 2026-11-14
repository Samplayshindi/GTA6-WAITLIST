/**
 * Utility functions for responsive image loading & Rockstar CDN resolution targeting
 */

export function getResponsiveImageUrl(url: string, targetWidth: number): string {
  if (!url) return '';

  // Preserve YouTube thumbnails and external non-Rockstar CDN assets
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return url;
  }

  // Handle Rockstar Games CDN imwidth parameter
  if (url.includes('imwidth=')) {
    return url.replace(/imwidth=\d+/, `imwidth=${targetWidth}`);
  }

  // Handle URL with query params
  if (url.includes('?')) {
    return `${url}&imwidth=${targetWidth}`;
  }

  // Standard clean URL
  return `${url}?imwidth=${targetWidth}`;
}

export function getImageSrcSet(url: string): string {
  if (!url) return '';
  const w320 = getResponsiveImageUrl(url, 320);
  const w640 = getResponsiveImageUrl(url, 640);
  const w1080 = getResponsiveImageUrl(url, 1080);
  const w1920 = getResponsiveImageUrl(url, 1920);

  return `${w320} 320w, ${w640} 640w, ${w1080} 1080w, ${w1920} 1920w`;
}
