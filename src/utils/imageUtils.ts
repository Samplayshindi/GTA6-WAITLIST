import imageManifest from '../data/imageManifest.json';

export interface ImageManifestEntry {
  id: string;
  w: number;
  h: number;
  origBytes: number;
  widths: number[];
}

export interface OptimizedImageData {
  isOptimized: boolean;
  entry: ImageManifestEntry | null;
  widths: number[];
  originalWidth?: number;
  originalHeight?: number;
  intrinsicWidth?: number;
  intrinsicHeight?: number;
  avifSrcSet: string;
  webpSrcSet: string;
  fallbackSrc: string;
  originalUrl: string;
}

export interface RawManifestEntry {
  id?: unknown;
  w?: unknown;
  h?: unknown;
  origBytes?: unknown;
  widths?: unknown;
}

const MANIFEST_MAP = (
  imageManifest && typeof imageManifest === 'object' ? imageManifest : {}
) as unknown as Record<string, RawManifestEntry>;

const OPTIMIZED_DATA_CACHE = new Map<string, OptimizedImageData>();

// Valid 1x1 AVIF payload for fast browser decode probing (needed for JS Image() preloaders / canvas)
const AVIF_PROBE_DATA_URI =
  'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAANZtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAACJpbG9jAAAAAERAAAEAAQAAAAAA+gABAAAAAAAAAB0AAAAjaWluZgAAAAAAAQAAABVpbmZlAgAAAAABAABhdjAxAAAAAA5waXRtAAAAAAABAAAAVmlwcnAAAAA4aXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAABZpcG1hAAAAAAAAAAEAAQOBAgMAAAAlbWRhdBIACgc4AAaQENBpMhAZQmMEwAA0AACQQM6Xt10S';

let avifSupportCache: boolean | null = null;
let avifSupportPromise: Promise<boolean> | null = null;

function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

export function resolveAssetPath(relPath: string): string {
  if (!relPath) return '';
  if (/^https?:\/\//i.test(relPath) || relPath.startsWith('data:')) {
    return relPath;
  }
  const cleanRel = relPath.replace(/^\/+/, '');
  return `${getBaseUrl()}${cleanRel}`;
}

export function normalizeImageUrl(url: string): string {
  if (!url) return '';
  const clean = url.split('?')[0].split('#')[0].trim();
  const base = getBaseUrl();
  if (base !== '/' && clean.startsWith(base)) {
    return `/${clean.slice(base.length)}`;
  }
  return clean;
}

export function getManifestEntry(url: string): ImageManifestEntry | null {
  if (!url) return null;
  const key = normalizeImageUrl(url);
  const raw = MANIFEST_MAP[key];
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.id !== 'string' || raw.id.trim().length === 0) return null;
  if (!Array.isArray(raw.widths)) return null;

  const validWidths = raw.widths.filter(
    (w): w is number => typeof w === 'number' && Number.isFinite(w) && w > 0
  );
  if (validWidths.length === 0) return null;

  return {
    id: raw.id,
    w: typeof raw.w === 'number' && Number.isFinite(raw.w) && raw.w > 0 ? raw.w : 0,
    h: typeof raw.h === 'number' && Number.isFinite(raw.h) && raw.h > 0 ? raw.h : 0,
    origBytes:
      typeof raw.origBytes === 'number' && Number.isFinite(raw.origBytes) ? raw.origBytes : 0,
    widths: validWidths,
  };
}

export function pickClosestWidth(widths: number[], targetWidth: number): number {
  if (!Array.isArray(widths) || widths.length === 0) return targetWidth;
  for (const w of widths) {
    if (w >= targetWidth) {
      return w;
    }
  }
  return widths[widths.length - 1];
}

export function getOptimizedVariantUrl(
  entry: ImageManifestEntry,
  width: number,
  format: 'avif' | 'webp' = 'avif'
): string {
  return resolveAssetPath(`/optimized-images/${entry.id}-${width}.${format}`);
}

export function detectAvifSupport(): Promise<boolean> {
  if (avifSupportCache !== null) {
    return Promise.resolve(avifSupportCache);
  }
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return Promise.resolve(false);
  }
  if (avifSupportPromise) {
    return avifSupportPromise;
  }

  avifSupportPromise = new Promise<boolean>((resolve) => {
    const probe = new Image();
    probe.onload = () => {
      avifSupportCache = probe.width > 0 && probe.height > 0;
      resolve(avifSupportCache);
    };
    probe.onerror = () => {
      avifSupportCache = false;
      resolve(false);
    };
    probe.src = AVIF_PROBE_DATA_URI;
  });

  return avifSupportPromise;
}

// Kick off lightweight decode check early in browser environments
if (typeof window !== 'undefined') {
  detectAvifSupport().catch(() => {});
}

export function getOptimizedImageData(url: string, maxWidth = 1920): OptimizedImageData {
  const safeUrl = typeof url === 'string' ? url : '';
  const cacheKey = `${safeUrl}|${maxWidth}`;
  const cached = OPTIMIZED_DATA_CACHE.get(cacheKey);
  if (cached) return cached;

  const entry = getManifestEntry(safeUrl);
  const widths = Array.isArray(entry?.widths) ? entry.widths : [];

  if (!entry || widths.length === 0) {
    const unoptimized: OptimizedImageData = {
      isOptimized: false,
      entry: null,
      widths: [],
      avifSrcSet: '',
      webpSrcSet: '',
      fallbackSrc: safeUrl,
      originalUrl: safeUrl,
    };
    if (safeUrl) OPTIMIZED_DATA_CACHE.set(cacheKey, unoptimized);
    return unoptimized;
  }

  let eligibleWidths = widths.filter((w) => w <= maxWidth);
  if (eligibleWidths.length === 0) {
    eligibleWidths = [widths[0]];
  }

  const avifSrcSet = eligibleWidths
    .map((w) => `${getOptimizedVariantUrl(entry, w, 'avif')} ${w}w`)
    .join(', ');
  const webpSrcSet = eligibleWidths
    .map((w) => `${getOptimizedVariantUrl(entry, w, 'webp')} ${w}w`)
    .join(', ');

  const defaultWidth = eligibleWidths[eligibleWidths.length - 1];
  const originalWidth = entry.w > 0 ? entry.w : undefined;
  const originalHeight = entry.h > 0 ? entry.h : undefined;
  let intrinsicWidth = originalWidth;
  let intrinsicHeight = originalHeight;

  if (originalWidth && originalHeight && defaultWidth < originalWidth) {
    intrinsicWidth = defaultWidth;
    intrinsicHeight = Math.max(1, Math.round(originalHeight * (defaultWidth / originalWidth)));
  }

  const result: OptimizedImageData = {
    isOptimized: true,
    entry,
    widths: eligibleWidths,
    originalWidth,
    originalHeight,
    intrinsicWidth,
    intrinsicHeight,
    avifSrcSet,
    webpSrcSet,
    fallbackSrc: getOptimizedVariantUrl(entry, defaultWidth, 'webp'),
    originalUrl: safeUrl,
  };

  OPTIMIZED_DATA_CACHE.set(cacheKey, result);
  return result;
}

export function getResponsiveImageUrl(
  url: string,
  targetWidth: number,
  format?: 'avif' | 'webp'
): string {
  if (!url) return '';

  const entry = getManifestEntry(url);
  if (entry && Array.isArray(entry.widths) && entry.widths.length > 0) {
    const chosenWidth = pickClosestWidth(entry.widths, targetWidth);
    const chosenFormat: 'avif' | 'webp' =
      format || (avifSupportCache === true ? 'avif' : 'webp');
    return getOptimizedVariantUrl(entry, chosenWidth, chosenFormat);
  }

  // Never rewrite unmanifested external URLs with imwidth — return original source URL cleanly
  return url;
}

export async function getPreferredPreloadUrl(url: string, targetWidth: number): Promise<string> {
  if (!url) return '';
  const supportsAvif = await detectAvifSupport();
  return getResponsiveImageUrl(url, targetWidth, supportsAvif ? 'avif' : 'webp');
}

export function estimateLightboxTargetWidth(): number {
  if (typeof window === 'undefined') return 1920;
  const vw = window.innerWidth;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = vw <= 639 ? vw * 0.94 : vw <= 1279 ? vw * 0.9 : 1440;
  return Math.round(cssWidth * dpr);
}

export function getImageSrcSet(
  url: string,
  format: 'avif' | 'webp' = 'webp',
  maxWidth = 1920
): string {
  const data = getOptimizedImageData(url, maxWidth);
  if (data.isOptimized) {
    return format === 'avif' ? data.avifSrcSet : data.webpSrcSet;
  }
  return '';
}
