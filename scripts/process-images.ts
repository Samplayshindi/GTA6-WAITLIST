import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { GALLERY_IMAGES } from '../src/data/galleryData';
import { CHARACTERS_DATA } from '../src/data/charactersData';
import { OFFICIAL_VIDEOS } from '../src/config/countdown';
import { OFFICIAL_GTA_IMAGE_CATALOG } from '../src/utils/newsImageMapper';
import { OFFICIAL_ALBUM_ARTWORK_URL, SOUNDTRACK_LIBRARY } from '../src/config/soundtrack';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'optimized-images');
const MANIFEST_PUB_PATH = path.join(OUTPUT_DIR, 'manifest.json');
const MANIFEST_SRC_PATH = path.join(process.cwd(), 'src', 'data', 'imageManifest.json');

const TARGET_WIDTHS = [375, 768, 1280, 1920] as const;
const CONCURRENCY = 1;
const FORCE_REBUILD = process.argv.includes('--force');

const DEFAULT_VICE_CITY_BG_URL =
  'https://www.rockstargames.com/VI/_next/static/media/VINTAGE_VICE_CITY_WEAPON_PATTERN_01.0gybtumgwdcoi.jpg';
const HERO_FALLBACK_URL = '/images/hero-4k.jpg';

export interface SourceImageJob {
  key: string;
  id: string;
  source: string;
  isLocal: boolean;
}

export interface CompactManifestEntry {
  id: string;
  w: number;
  h: number;
  origBytes: number;
  widths: number[];
}

interface DetailedVariantInfo {
  width: number;
  height: number;
  avif: string;
  webp: string;
  avifBytes: number;
  webpBytes: number;
}

interface DetailedManifestEntry {
  id: string;
  source: string;
  originalWidth: number;
  originalHeight: number;
  originalBytes: number;
  widths: number[];
  variants: Record<string, DetailedVariantInfo>;
}

function normalizeKey(url: string): string {
  if (!url) return '';
  return url.split('?')[0].split('#')[0].trim();
}

function stripImwidthAndParams(url: string): string {
  if (!url) return '';
  if (url.startsWith('/')) {
    return url.split('?')[0].split('#')[0].trim();
  }
  try {
    const parsed = new URL(url);
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return normalizeKey(url);
  }
}

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function atomicWriteFileSync(targetPath: string, content: string): void {
  const tmpPath = `${targetPath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, content, 'utf-8');
  fs.renameSync(tmpPath, targetPath);
}

function safeUnlink(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore cleanup errors on temp files
  }
}

function extractSlideshowUrls(): string[] {
  const filePath = path.join(process.cwd(), 'src', 'components', 'AtmosphericBackground.tsx');
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.match(/https:\/\/www\.rockstargames\.com\/VI\/[^'"]+/g) || [];
}

function collectSourceJobs(): SourceImageJob[] {
  const jobsMap = new Map<string, SourceImageJob>();
  const usedIds = new Set<string>();

  const register = (rawUrl: string, preferredId: string) => {
    const key = normalizeKey(rawUrl);
    if (!key || key.endsWith('.svg') || jobsMap.has(key)) return;

    let id = sanitizeId(preferredId);
    let suffix = 1;
    while (usedIds.has(id)) {
      id = `${sanitizeId(preferredId)}_${suffix++}`;
    }
    usedIds.add(id);

    const isLocal = key.startsWith('/');
    jobsMap.set(key, { key, id, source: stripImwidthAndParams(key), isLocal });
  };

  // 1. Gallery artwork (141)
  for (const item of GALLERY_IMAGES) {
    register(item.url, item.id);
  }

  // 2. Character dossier artwork
  for (const char of CHARACTERS_DATA) {
    char.images.forEach((imgUrl, idx) => {
      register(imgUrl, `char-${char.id}-${idx}`);
    });
  }

  // 3. Background slideshow artwork
  extractSlideshowUrls().forEach((slideUrl, idx) => {
    register(slideUrl, `slide-${idx}`);
  });

  // 4. Default share modal Vice City background pattern
  register(DEFAULT_VICE_CITY_BG_URL, 'vice-city-weapon-pattern');

  // 5. Local raster hero / trailer / newswire artwork
  register(HERO_FALLBACK_URL, 'local-hero-4k');
  for (const video of OFFICIAL_VIDEOS) {
    register(video.thumbnailUrl, `video-${video.id}`);
  }
  for (const cat of OFFICIAL_GTA_IMAGE_CATALOG) {
    const baseName = path.basename(cat.url, path.extname(cat.url));
    register(cat.url, `local-${baseName}`);
  }

  // 6. Official soundtrack cover artwork
  register(OFFICIAL_ALBUM_ARTWORK_URL, 'soundtrack-album-art');
  for (const track of SOUNDTRACK_LIBRARY) {
    if (track.coverUrl) {
      register(track.coverUrl, `track-${track.id}`);
    }
  }

  // Include remaining raster .jpg/.png files in public/images/
  const publicImagesDir = path.join(PUBLIC_DIR, 'images');
  if (fs.existsSync(publicImagesDir)) {
    for (const file of fs.readdirSync(publicImagesDir)) {
      if (/\.(jpe?g|png)$/i.test(file)) {
        const baseName = path.basename(file, path.extname(file));
        register(`/images/${file}`, `local-${baseName}`);
      }
    }
  }

  return Array.from(jobsMap.values());
}

async function fetchWithRetry(url: string, attempts = 4): Promise<Buffer> {
  const cleanUrl = stripImwidthAndParams(url);
  let lastErr: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(cleanUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GTAVIWaitlistImageOptimizer/1.0)',
          Accept: 'image/*,*/*;q=0.8',
        },
      });
      clearTimeout(timeout);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${cleanUrl}`);
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
      if (attempt < attempts) {
        await new Promise((r) => setTimeout(r, 600 * attempt));
      }
    }
  }
  throw lastErr;
}

async function loadSourceBuffer(job: SourceImageJob): Promise<Buffer> {
  if (job.isLocal) {
    const localPath = path.join(PUBLIC_DIR, job.source.replace(/^\/+/, ''));
    return fs.readFileSync(localPath);
  }
  return fetchWithRetry(job.source);
}

function getTargetWidthsForOriginal(originalWidth: number): number[] {
  const valid = TARGET_WIDTHS.filter((w) => w <= originalWidth);
  if (valid.length === 0) {
    return [originalWidth];
  }
  // Ensure the largest non-upscaled width covers natural width when between target brackets
  const maxValid = valid[valid.length - 1];
  if (originalWidth < TARGET_WIDTHS[TARGET_WIDTHS.length - 1] && originalWidth > maxValid) {
    return [...valid, originalWidth];
  }
  return valid;
}

interface VerifiedFileMeta {
  width: number;
  height: number;
  bytes: number;
}

async function verifyExistingImageFile(
  filePath: string,
  expectedFormat: 'avif' | 'webp',
  expectedWidth: number
): Promise<VerifiedFileMeta | null> {
  try {
    if (!fs.existsSync(filePath)) return null;
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || stat.size <= 0) return null;

    const meta = await sharp(filePath, { failOn: 'none' }).metadata();
    const formatOk =
      expectedFormat === 'avif'
        ? meta.format === 'heif' && (!meta.compression || meta.compression === 'av1')
        : meta.format === 'webp';
    if (!formatOk) return null;
    if (!meta.width || !meta.height || meta.width !== expectedWidth) return null;

    return { width: meta.width, height: meta.height, bytes: stat.size };
  } catch {
    return null;
  }
}

async function writeVariantAtomically(
  resizedRaw: Buffer,
  rawInput: { raw: { width: number; height: number; channels: 1 | 2 | 3 | 4 } },
  targetAbs: string,
  format: 'avif' | 'webp',
  expectedWidth: number
): Promise<VerifiedFileMeta> {
  const tmpAbs = `${targetAbs}.${process.pid}.tmp`;
  safeUnlink(tmpAbs);
  try {
    const pipeline = sharp(resizedRaw, rawInput);
    if (format === 'webp') {
      await pipeline.webp({ quality: 82, effort: 4 }).toFile(tmpAbs);
    } else {
      await pipeline.avif({ quality: 58, effort: 2 }).toFile(tmpAbs);
    }

    const verified = await verifyExistingImageFile(tmpAbs, format, expectedWidth);
    if (!verified) {
      throw new Error(`Atomic output verification failed for ${path.basename(targetAbs)}`);
    }

    fs.renameSync(tmpAbs, targetAbs);
    return verified;
  } catch (err) {
    safeUnlink(tmpAbs);
    throw err;
  }
}

async function inspectReusableVariants(
  job: SourceImageJob,
  widthsToCheck: number[],
  previousEntry?: DetailedManifestEntry,
  previousCompact?: CompactManifestEntry
): Promise<Record<number, { avif: VerifiedFileMeta | null; webp: VerifiedFileMeta | null }>> {
  const result: Record<number, { avif: VerifiedFileMeta | null; webp: VerifiedFileMeta | null }> = {};
  if (FORCE_REBUILD) {
    for (const w of widthsToCheck) {
      result[w] = { avif: null, webp: null };
    }
    return result;
  }

  for (const w of widthsToCheck) {
    const avifPath = path.join(OUTPUT_DIR, `${job.id}-${w}.avif`);
    const webpPath = path.join(OUTPUT_DIR, `${job.id}-${w}.webp`);

    const avifMeta = await verifyExistingImageFile(avifPath, 'avif', w);
    let webpMeta = await verifyExistingImageFile(webpPath, 'webp', w);

    // Prevent legacy SVG placeholder WebPs (which lack matching AVIF and aren't in verified src manifest)
    // from being mistaken for genuine photo variants.
    if (webpMeta) {
      const inCompact = Boolean(previousCompact?.widths?.includes(w));
      const matchesPrevDetailedBytes =
        previousEntry?.variants?.[String(w)]?.webpBytes === webpMeta.bytes;
      if (!inCompact && !avifMeta && !matchesPrevDetailedBytes) {
        webpMeta = null;
      }
    }

    result[w] = { avif: avifMeta, webp: webpMeta };
  }

  return result;
}

async function processSingleImage(
  job: SourceImageJob,
  previousEntry?: DetailedManifestEntry,
  previousCompact?: CompactManifestEntry
): Promise<{ entry: DetailedManifestEntry; reusedAll: boolean }> {
  // Fast resume path: reuse existing verified AVIF+WebP variants without downloading source
  if (
    !FORCE_REBUILD &&
    previousEntry &&
    previousEntry.id === job.id &&
    previousEntry.originalWidth > 0 &&
    previousEntry.originalHeight > 0 &&
    previousEntry.originalBytes > 0
  ) {
    const expectedWidths = getTargetWidthsForOriginal(previousEntry.originalWidth);
    const inspected = await inspectReusableVariants(
      job,
      expectedWidths,
      previousEntry,
      previousCompact
    );
    const allValid = expectedWidths.every((w) => inspected[w]?.avif && inspected[w]?.webp);

    if (allValid) {
      const variants: Record<string, DetailedVariantInfo> = {};
      for (const w of expectedWidths) {
        const avif = inspected[w].avif!;
        const webp = inspected[w].webp!;
        variants[String(w)] = {
          width: webp.width,
          height: webp.height,
          avif: `/optimized-images/${job.id}-${w}.avif`,
          webp: `/optimized-images/${job.id}-${w}.webp`,
          avifBytes: avif.bytes,
          webpBytes: webp.bytes,
        };
      }
      return {
        reusedAll: true,
        entry: {
          id: job.id,
          source: job.source,
          originalWidth: previousEntry.originalWidth,
          originalHeight: previousEntry.originalHeight,
          originalBytes: previousEntry.originalBytes,
          widths: expectedWidths,
          variants,
        },
      };
    }
  }

  const sourceBuffer = await loadSourceBuffer(job);
  const originalBytes = sourceBuffer.length;

  // Apply EXIF orientation once before reading canonical dimensions
  const oriented = sharp(sourceBuffer, { failOn: 'none' }).rotate();
  const { data: orientedRaw, info: orientedInfo } = await oriented.toBuffer({
    resolveWithObject: true,
  });

  const originalWidth = orientedInfo.width;
  const originalHeight = orientedInfo.height;
  if (!originalWidth || !originalHeight) {
    throw new Error(`Invalid decoded dimensions for ${job.source}`);
  }

  const widthsToGenerate = getTargetWidthsForOriginal(originalWidth);
  const existing = await inspectReusableVariants(
    job,
    widthsToGenerate,
    previousEntry,
    previousCompact
  );
  const variants: Record<string, DetailedVariantInfo> = {};

  // Process widths strictly sequentially to bound memory & CPU usage
  for (const targetW of widthsToGenerate) {
    const avifRel = `/optimized-images/${job.id}-${targetW}.avif`;
    const webpRel = `/optimized-images/${job.id}-${targetW}.webp`;
    const avifAbs = path.join(PUBLIC_DIR, avifRel.replace(/^\/+/, ''));
    const webpAbs = path.join(PUBLIC_DIR, webpRel.replace(/^\/+/, ''));

    let avifMeta = existing[targetW]?.avif ?? null;
    let webpMeta = existing[targetW]?.webp ?? null;

    if (!avifMeta || !webpMeta) {
      const { data: resizedRaw, info: resizedInfo } = await sharp(orientedRaw, {
        failOn: 'none',
      })
        .resize({ width: targetW, fit: 'inside', withoutEnlargement: true })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const channels = resizedInfo.channels as 1 | 2 | 3 | 4;
      const rawInput = {
        raw: {
          width: resizedInfo.width,
          height: resizedInfo.height,
          channels,
        },
      };

      if (!webpMeta) {
        webpMeta = await writeVariantAtomically(
          resizedRaw,
          rawInput,
          webpAbs,
          'webp',
          resizedInfo.width
        );
      }
      if (!avifMeta) {
        avifMeta = await writeVariantAtomically(
          resizedRaw,
          rawInput,
          avifAbs,
          'avif',
          resizedInfo.width
        );
      }
    }

    variants[String(targetW)] = {
      width: webpMeta.width,
      height: webpMeta.height,
      avif: avifRel,
      webp: webpRel,
      avifBytes: avifMeta.bytes,
      webpBytes: webpMeta.bytes,
    };
  }

  return {
    reusedAll: false,
    entry: {
      id: job.id,
      source: job.source,
      originalWidth,
      originalHeight,
      originalBytes,
      widths: widthsToGenerate,
      variants,
    },
  };
}

function buildSummary(detailedManifest: Record<string, DetailedManifestEntry>, errorCount: number) {
  let totalOrigBytes = 0;
  let totalAvifBytes = 0;
  let totalWebpBytes = 0;
  let totalVariants = 0;

  for (const entry of Object.values(detailedManifest)) {
    totalOrigBytes += entry.originalBytes;
    for (const w of entry.widths) {
      const v = entry.variants[String(w)];
      if (!v) continue;
      totalAvifBytes += v.avifBytes;
      totalWebpBytes += v.webpBytes;
      totalVariants += 2;
    }
  }

  const totalOptimizedBytes = totalAvifBytes + totalWebpBytes;
  const maxWidthAvifBytes = Object.values(detailedManifest).reduce((acc, e) => {
    const maxW = e.widths[e.widths.length - 1];
    return acc + (e.variants[String(maxW)]?.avifBytes || 0);
  }, 0);
  const maxWidthWebpBytes = Object.values(detailedManifest).reduce((acc, e) => {
    const maxW = e.widths[e.widths.length - 1];
    return acc + (e.variants[String(maxW)]?.webpBytes || 0);
  }, 0);

  return {
    generatedAt: new Date().toISOString(),
    imagesProcessed: Object.keys(detailedManifest).length,
    totalVariantsGenerated: totalVariants,
    originalTotalBytes: totalOrigBytes,
    optimizedAllVariantsTotalBytes: totalOptimizedBytes,
    avifAllWidthsBytes: totalAvifBytes,
    webpAllWidthsBytes: totalWebpBytes,
    maxResAvifTotalBytes: maxWidthAvifBytes,
    maxResWebpTotalBytes: maxWidthWebpBytes,
    avifSavingsVsOriginalPct:
      totalOrigBytes > 0 ? +((1 - maxWidthAvifBytes / totalOrigBytes) * 100).toFixed(2) : 0,
    webpSavingsVsOriginalPct:
      totalOrigBytes > 0 ? +((1 - maxWidthWebpBytes / totalOrigBytes) * 100).toFixed(2) : 0,
    allVariantsSavingsVsOriginalPct:
      totalOrigBytes > 0 ? +((1 - totalOptimizedBytes / totalOrigBytes) * 100).toFixed(2) : 0,
    removedStaleFiles: 0,
    errorCount,
  };
}

function saveManifestsAtomically(
  compactManifest: Record<string, CompactManifestEntry>,
  detailedManifest: Record<string, DetailedManifestEntry>,
  errorCount: number
) {
  const summary = buildSummary(detailedManifest, errorCount);
  atomicWriteFileSync(MANIFEST_SRC_PATH, JSON.stringify(compactManifest, null, 2));
  atomicWriteFileSync(
    MANIFEST_PUB_PATH,
    JSON.stringify({ summary, images: detailedManifest }, null, 2)
  );
  return summary;
}

async function main() {
  // Keep sharp internal threadpool bounded cleanly alongside CONCURRENCY=1
  sharp.concurrency(2);
  sharp.cache({ memory: 64, files: 10, items: 50 });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(MANIFEST_SRC_PATH), { recursive: true });

  // Clean up only leftover temporary files from prior interrupted atomic writes (never delete legacy/valid files)
  for (const file of fs.readdirSync(OUTPUT_DIR)) {
    if (file.endsWith('.tmp')) {
      safeUnlink(path.join(OUTPUT_DIR, file));
    }
  }

  let previousDetailed: Record<string, DetailedManifestEntry> = {};
  if (!FORCE_REBUILD && fs.existsSync(MANIFEST_PUB_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(MANIFEST_PUB_PATH, 'utf-8'));
      if (parsed?.images && typeof parsed.images === 'object') {
        previousDetailed = parsed.images;
      }
    } catch {
      previousDetailed = {};
    }
  }

  let previousCompact: Record<string, CompactManifestEntry> = {};
  if (!FORCE_REBUILD && fs.existsSync(MANIFEST_SRC_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(MANIFEST_SRC_PATH, 'utf-8'));
      if (parsed && typeof parsed === 'object') {
        previousCompact = parsed;
      }
    } catch {
      previousCompact = {};
    }
  }

  const jobs = collectSourceJobs();
  console.log(
    `[ImagePipeline] Found ${jobs.length} unique supported images (${TARGET_WIDTHS.join('/')}px AVIF + WebP, concurrency=${CONCURRENCY}).`
  );

  // Preserve verified entries at startup so incremental checkpoints never lose prior progress
  const detailedManifest: Record<string, DetailedManifestEntry> = {};
  const compactManifest: Record<string, CompactManifestEntry> = {};

  if (!FORCE_REBUILD) {
    for (const [key, comp] of Object.entries(previousCompact)) {
      if (!comp?.id || !Array.isArray(comp.widths) || comp.widths.length === 0) continue;
      const validWidths = comp.widths.filter((w) => {
        const avifAbs = path.join(OUTPUT_DIR, `${comp.id}-${w}.avif`);
        const webpAbs = path.join(OUTPUT_DIR, `${comp.id}-${w}.webp`);
        return (
          fs.existsSync(avifAbs) &&
          fs.existsSync(webpAbs) &&
          fs.statSync(avifAbs).size > 0 &&
          fs.statSync(webpAbs).size > 0
        );
      });
      if (validWidths.length > 0) {
        compactManifest[key] = { ...comp, widths: validWidths };
        const prevDet = previousDetailed[key];
        if (prevDet) {
          const filteredVariants: Record<string, DetailedVariantInfo> = {};
          for (const w of validWidths) {
            const v = prevDet.variants?.[String(w)];
            if (v) filteredVariants[String(w)] = v;
          }
          detailedManifest[key] = { ...prevDet, widths: validWidths, variants: filteredVariants };
        }
      }
    }
  }

  const errors: string[] = [];
  let completed = 0;
  let reusedCount = 0;
  let generatedCount = 0;

  for (const job of jobs) {
    try {
      const { entry, reusedAll } = await processSingleImage(
        job,
        previousDetailed[job.key],
        previousCompact[job.key]
      );
      detailedManifest[job.key] = entry;
      compactManifest[job.key] = {
        id: entry.id,
        w: entry.originalWidth,
        h: entry.originalHeight,
        origBytes: entry.originalBytes,
        widths: entry.widths,
      };
      if (reusedAll) reusedCount++;
      else generatedCount++;
      completed++;

      saveManifestsAtomically(compactManifest, detailedManifest, errors.length);

      if (completed % 10 === 0 || !reusedAll || completed === jobs.length) {
        console.log(
          `[ImagePipeline] Progress: ${completed}/${jobs.length} (reused=${reusedCount}, processed=${generatedCount}) [${entry.id}]`
        );
      }
    } catch (err) {
      const msg = `${job.id} (${job.source}): ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      console.error(`[ImagePipeline] ERROR ${msg}`);
      saveManifestsAtomically(compactManifest, detailedManifest, errors.length);
    }
  }

  const summary = saveManifestsAtomically(compactManifest, detailedManifest, errors.length);
  console.log('[ImagePipeline] Summary:', JSON.stringify(summary, null, 2));

  if (errors.length > 0) {
    console.error(`[ImagePipeline] Completed with ${errors.length} errors.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[ImagePipeline] Fatal error:', err);
  process.exit(1);
});
