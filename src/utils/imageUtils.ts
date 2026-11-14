import imageManifest from '../data/imageManifest.json';

export interface ImageManifestEntry {
  id: string;
  w: number;
  h: number;
  origBytes: number;
  widths: number[];
  avifWidths: number[];
  webpWidths: number[];
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
  preferredAvifUrl: string;
  preferredWebpUrl: string;
  fallbackSrc: string;
  originalUrl: string;
}

export interface RawManifestEntry {
  id?: unknown;
  w?: unknown;
  h?: unknown;
  origBytes?: unknown;
  widths?: unknown;
  avifWidths?: unknown;
  webpWidths?: unknown;
}

const MANIFEST_MAP = (
  imageManifest && typeof imageManifest === 'object' ? imageManifest : {}
) as unknown as Record<string, RawManifestEntry>;

const OPTIMIZED_DATA_CACHE = new Map<string, OptimizedImageData>();
const PRELOADED_URL_CACHE = new Map<string, string>();
const LOADED_SOURCE_CACHE = new Map<string, string>();
const FAILED_VARIANT_URLS = new Set<string>();
const INFLIGHT_PRELOADS = new Map<string, Promise<string>>();

// Valid 1x1 AVIF payload for fast browser decode probing (needed for JS Image() preloaders / canvas)
const AVIF_PROBE_DATA_URI =
  'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAANZtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAACJpbG9jAAAAAERAAAEAAQAAAAAA+gABAAAAAAAAAB0AAAAjaWluZgAAAAAAAQAAABVpbmZlAgAAAAABAABhdjAxAAAAAA5waXRtAAAAAAABAAAAVmlwcnAAAAA4aXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAABZpcG1hAAAAAAAAAAEAAQOBAgMAAAAlbWRhdBIACgc4AAaQENBpMhAZQmMEwAA0AACQQM6Xt10S';

let avifSupportCache: boolean | null = null;
let avifSupportPromise: Promise<boolean> | null = null;

function getBaseUrl(): string {
  const meta = import.meta as unknown as { env?: { BASE_URL?: string } };
  const base = meta?.env?.BASE_URL || '/';
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

function parseWidthArray(raw: unknown): number[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.filter((w): w is number => typeof w === 'number' && Number.isFinite(w) && w > 0);
}

export function getManifestEntry(url: string): ImageManifestEntry | null {
  if (!url) return null;
  const key = normalizeImageUrl(url);
  const raw = MANIFEST_MAP[key];
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.id !== 'string' || raw.id.trim().length === 0) return null;

  const validWidths = parseWidthArray(raw.widths);
  if (!validWidths || validWidths.length === 0) return null;

  const avifWidths = parseWidthArray(raw.avifWidths) ?? validWidths;
  const webpWidths = parseWidthArray(raw.webpWidths) ?? validWidths;
  if (avifWidths.length === 0 && webpWidths.length === 0) return null;

  return {
    id: raw.id,
    w: typeof raw.w === 'number' && Number.isFinite(raw.w) && raw.w > 0 ? raw.w : 0,
    h: typeof raw.h === 'number' && Number.isFinite(raw.h) && raw.h > 0 ? raw.h : 0,
    origBytes:
      typeof raw.origBytes === 'number' && Number.isFinite(raw.origBytes) ? raw.origBytes : 0,
    widths: validWidths,
    avifWidths,
    webpWidths,
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

function pickEligibleWidths(sourceWidths: number[], maxWidth: number): number[] {
  if (sourceWidths.length === 0) return [];
  const filtered = sourceWidths.filter((w) => w <= maxWidth);
  return filtered.length > 0 ? filtered : [sourceWidths[0]];
}

/**
 * Returns local optimized variant URLs ordered by the 4-step intelligent fallback hierarchy:
 * 1. Preferred local AVIF at closest width >= targetWidth
 * 2. Appropriate local WebP at closest width >= targetWidth
 * 3. Closest available local optimized variant >= targetWidth (escalating to larger local
 *    optimized variants before stepping down to smaller local widths), avoiding failed URLs
 */
export function getClosestLocalVariantCandidates(
  entry: ImageManifestEntry,
  targetWidth: number,
  preferAvif = avifSupportCache !== false
): string[] {
  const candidates: string[] = [];
  const pushUnique = (u: string) => {
    if (u && !FAILED_VARIANT_URLS.has(u) && !candidates.includes(u)) {
      candidates.push(u);
    }
  };

  const avifSorted = [...entry.avifWidths].sort((a, b) => a - b);
  const webpSorted = [...entry.webpWidths].sort((a, b) => a - b);

  const avifAtOrAbove = avifSorted.filter((w) => w >= targetWidth);
  const webpAtOrAbove = webpSorted.filter((w) => w >= targetWidth);
  const avifBelow = avifSorted.filter((w) => w < targetWidth).sort((a, b) => b - a);
  const webpBelow = webpSorted.filter((w) => w < targetWidth).sort((a, b) => b - a);

  // Step 1 & 2: Preferred format & fallback format at ideal width (>= targetWidth)
  if (preferAvif && avifAtOrAbove.length > 0) {
    pushUnique(getOptimizedVariantUrl(entry, avifAtOrAbove[0], 'avif'));
  }
  if (webpAtOrAbove.length > 0) {
    pushUnique(getOptimizedVariantUrl(entry, webpAtOrAbove[0], 'webp'));
  }

  // Step 3a: Escalate through larger local variants (>= targetWidth) before shrinking
  const allLargerWidths = Array.from(new Set([...avifAtOrAbove, ...webpAtOrAbove])).sort((a, b) => a - b);
  for (const w of allLargerWidths) {
    if (preferAvif && entry.avifWidths.includes(w)) {
      pushUnique(getOptimizedVariantUrl(entry, w, 'avif'));
    }
    if (entry.webpWidths.includes(w)) {
      pushUnique(getOptimizedVariantUrl(entry, w, 'webp'));
    }
  }

  // Step 3b: Only if no local variant >= targetWidth is available, step to largest available local variant < targetWidth
  if (preferAvif) {
    for (const w of avifBelow) pushUnique(getOptimizedVariantUrl(entry, w, 'avif'));
  }
  for (const w of webpBelow) pushUnique(getOptimizedVariantUrl(entry, w, 'webp'));

  return candidates;
}

export function markVariantFailed(url: string): void {
  if (url) FAILED_VARIANT_URLS.add(url);
}

export function getCachedResolvedSource(sourceKey: string): string | undefined {
  return LOADED_SOURCE_CACHE.get(sourceKey);
}

export function setCachedResolvedSource(sourceKey: string, resolvedUrl: string): void {
  if (!sourceKey || !resolvedUrl) return;
  LOADED_SOURCE_CACHE.set(sourceKey, resolvedUrl);
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
      preferredAvifUrl: '',
      preferredWebpUrl: '',
      fallbackSrc: safeUrl,
      originalUrl: safeUrl,
    };
    if (safeUrl) OPTIMIZED_DATA_CACHE.set(cacheKey, unoptimized);
    return unoptimized;
  }

  const eligibleAvifWidths = pickEligibleWidths(entry.avifWidths, maxWidth);
  const eligibleWebpWidths = pickEligibleWidths(entry.webpWidths, maxWidth);
  const eligibleWidths = Array.from(
    new Set([...eligibleAvifWidths, ...eligibleWebpWidths])
  ).sort((a, b) => a - b);

  const avifSrcSet = eligibleAvifWidths
    .map((w) => `${getOptimizedVariantUrl(entry, w, 'avif')} ${w}w`)
    .join(', ');
  const webpSrcSet = eligibleWebpWidths
    .map((w) => `${getOptimizedVariantUrl(entry, w, 'webp')} ${w}w`)
    .join(', ');

  const defaultAvifWidth =
    eligibleAvifWidths.length > 0 ? eligibleAvifWidths[eligibleAvifWidths.length - 1] : 0;
  const defaultWebpWidth =
    eligibleWebpWidths.length > 0 ? eligibleWebpWidths[eligibleWebpWidths.length - 1] : 0;
  const defaultWidth = defaultWebpWidth || defaultAvifWidth || eligibleWidths[eligibleWidths.length - 1];

  const preferredAvifUrl =
    defaultAvifWidth > 0 ? getOptimizedVariantUrl(entry, defaultAvifWidth, 'avif') : '';
  const preferredWebpUrl =
    defaultWebpWidth > 0 ? getOptimizedVariantUrl(entry, defaultWebpWidth, 'webp') : '';

  const originalWidth = entry.w > 0 ? entry.w : undefined;
  const originalHeight = entry.h > 0 ? entry.h : undefined;
  let intrinsicWidth = originalWidth;
  let intrinsicHeight = originalHeight;

  if (originalWidth && originalHeight && defaultWidth > 0 && defaultWidth < originalWidth) {
    intrinsicWidth = defaultWidth;
    intrinsicHeight = Math.max(1, Math.round(originalHeight * (defaultWidth / originalWidth)));
  }

  const result: OptimizedImageData = {
    isOptimized: Boolean(avifSrcSet || webpSrcSet),
    entry,
    widths: eligibleWidths,
    originalWidth,
    originalHeight,
    intrinsicWidth,
    intrinsicHeight,
    avifSrcSet,
    webpSrcSet,
    preferredAvifUrl,
    preferredWebpUrl,
    fallbackSrc: preferredWebpUrl || preferredAvifUrl || safeUrl,
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
  if (entry) {
    const preferAvif = format ? format === 'avif' : avifSupportCache === true;
    const candidates = getClosestLocalVariantCandidates(entry, targetWidth, preferAvif);
    if (format) {
      const formatMatched = candidates.find((u) => u.endsWith(`.${format}`));
      if (formatMatched) return formatMatched;
    }
    if (candidates.length > 0) {
      return candidates[0];
    }
  }

  // Never rewrite unmanifested external URLs with imwidth — return original source URL cleanly
  return url;
}

export async function getPreloadCandidateUrls(url: string, targetWidth: number): Promise<string[]> {
  if (!url) return [];
  const supportsAvif = await detectAvifSupport();
  const entry = getManifestEntry(url);
  const candidates: string[] = [];

  if (entry) {
    candidates.push(...getClosestLocalVariantCandidates(entry, targetWidth, supportsAvif));
  }

  // Step 4: Canonical original source only when no suitable local variant exists / succeeds
  candidates.push(url);
  return Array.from(new Set(candidates.filter(Boolean)));
}

export async function getPreferredPreloadUrl(url: string, targetWidth: number): Promise<string> {
  const candidates = await getPreloadCandidateUrls(url, targetWidth);
  return candidates[0] || url;
}

export function isImagePreloaded(url: string, targetWidth: number): boolean {
  return PRELOADED_URL_CACHE.has(`${url}|${targetWidth}`);
}

export function markImagePreloaded(url: string, targetWidth: number, resolvedUrl: string): void {
  if (!url || !resolvedUrl) return;
  PRELOADED_URL_CACHE.set(`${url}|${targetWidth}`, resolvedUrl);
}

function loadAndDecodeSingleUrl(candidateUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve(false);
      return;
    }
    const img = new Image();
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };

    img.onload = () => {
      if (typeof img.decode === 'function') {
        img
          .decode()
          .then(() => finish(true))
          .catch(() => finish(img.naturalWidth > 0));
      } else {
        finish(img.naturalWidth > 0);
      }
    };
    img.onerror = () => finish(false);
    img.src = candidateUrl;

    if (img.complete && img.naturalWidth > 0) {
      finish(true);
    }
  });
}

/**
 * Reliably preloads & decodes an image using the 4-step intelligent fallback chain:
 * AVIF -> WebP -> closest local optimized variant -> canonical original source.
 * Deduplicates concurrent requests and caches resolved URLs in memory.
 */
export async function preloadImageWithFallback(
  url: string,
  targetWidth: number
): Promise<string> {
  if (!url || typeof window === 'undefined') return '';
  const cacheKey = `${url}|${targetWidth}`;
  const cached = PRELOADED_URL_CACHE.get(cacheKey);
  if (cached) return cached;

  const inflight = INFLIGHT_PRELOADS.get(cacheKey);
  if (inflight) return inflight;

  const run = (async () => {
    const candidates = await getPreloadCandidateUrls(url, targetWidth);
    for (const candidate of candidates) {
      const ok = await loadAndDecodeSingleUrl(candidate);
      if (ok) {
        PRELOADED_URL_CACHE.set(cacheKey, candidate);
        return candidate;
      }
      if (candidate !== url) {
        markVariantFailed(candidate);
      }
    }
    return '';
  })().finally(() => {
    INFLIGHT_PRELOADS.delete(cacheKey);
  });

  INFLIGHT_PRELOADS.set(cacheKey, run);
  return run;
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
