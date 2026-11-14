import { lazy, type ComponentType } from 'react';

type ModuleLoader<T> = () => Promise<{ default: T }>;

const loaderCache = new Map<string, Promise<unknown>>();

function cachedImport<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = loaderCache.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const promise = factory().catch((err) => {
    // Allow retry if a transient network failure prevented loading the chunk
    loaderCache.delete(key);
    throw err;
  });
  loaderCache.set(key, promise);
  return promise;
}

export const loadCharactersModule = () =>
  cachedImport('/characters', () =>
    import('../components/CharactersPage').then((m) => ({ default: m.CharactersPage }))
  );

export const loadGalleryModule = () =>
  cachedImport('/gallery', () =>
    import('../components/GalleryPage').then((m) => ({ default: m.GalleryPage }))
  );

export const loadVideosModule = () =>
  cachedImport('/videos', () =>
    import('../components/TrailerGallery').then((m) => ({ default: m.TrailerGallery }))
  );

export const loadNewswireModule = () =>
  cachedImport('/newswire', () =>
    import('../components/NewsSection').then((m) => ({ default: m.NewsSection }))
  );

export const loadTimelineModule = () =>
  cachedImport('/timeline', () =>
    import('../components/TimelineSection').then((m) => ({ default: m.TimelineSection }))
  );

export const loadFaqModule = () =>
  cachedImport('/faq', () =>
    import('../components/FaqSection').then((m) => ({ default: m.FaqSection }))
  );

export const loadDetailsModule = () =>
  cachedImport('/details', () =>
    import('../components/ReleaseInformation').then((m) => ({ default: m.ReleaseInformation }))
  );

function lazyWithCache<T extends ComponentType<any>>(loader: ModuleLoader<T>) {
  return lazy(loader);
}

export const CharactersPageLazy = lazyWithCache(loadCharactersModule);
export const GalleryPageLazy = lazyWithCache(loadGalleryModule);
export const TrailerGalleryLazy = lazyWithCache(loadVideosModule);
export const NewsSectionLazy = lazyWithCache(loadNewswireModule);
export const TimelineSectionLazy = lazyWithCache(loadTimelineModule);
export const FaqSectionLazy = lazyWithCache(loadFaqModule);
export const ReleaseInformationLazy = lazyWithCache(loadDetailsModule);

export function resolveRouteKey(target: string): string {
  const clean = target.toLowerCase().trim().replace(/\/+$/, '') || '/';
  if (clean === 'characters' || clean === '/characters') return '/characters';
  if (clean === 'gallery' || clean === '/gallery') return '/gallery';
  if (clean === 'videos' || clean === '/videos') return '/videos';
  if (clean === 'newswire' || clean === '/newswire') return '/newswire';
  if (clean === 'timeline' || clean === '/timeline') return '/timeline';
  if (clean === 'faq' || clean === '/faq') return '/faq';
  if (
    clean === 'specifications' ||
    clean === 'details' ||
    clean === 'specs' ||
    clean === '/details' ||
    clean === '/specs' ||
    clean === '/specifications'
  ) {
    return '/details';
  }
  return '/';
}

export function prefetchRoute(target: string): void {
  const key = resolveRouteKey(target);
  switch (key) {
    case '/characters':
      void loadCharactersModule().catch(() => {});
      break;
    case '/gallery':
      void loadGalleryModule().catch(() => {});
      break;
    case '/videos':
      void loadVideosModule().catch(() => {});
      break;
    case '/newswire':
      void loadNewswireModule().catch(() => {});
      break;
    case '/timeline':
      void loadTimelineModule().catch(() => {});
      break;
    case '/faq':
      void loadFaqModule().catch(() => {});
      break;
    case '/details':
      void loadDetailsModule().catch(() => {});
      break;
    default:
      break;
  }
}

export function scheduleIdleRoutePrefetch(): () => void {
  if (typeof window === 'undefined') return () => {};

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData) return () => {};

  const routeKeys = [
    '/characters',
    '/gallery',
    '/videos',
    '/newswire',
    '/timeline',
    '/faq',
    '/details',
  ];

  let cancelled = false;
  let idleHandle: number | null = null;
  let timerHandle: ReturnType<typeof setTimeout> | null = null;

  const runPrefetchBatch = () => {
    if (cancelled) return;
    let index = 0;
    const step = () => {
      if (cancelled || index >= routeKeys.length) return;
      prefetchRoute(routeKeys[index]);
      index += 1;
      if (index < routeKeys.length) {
        timerHandle = setTimeout(step, 120);
      }
    };
    step();
  };

  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof w.requestIdleCallback === 'function') {
    idleHandle = w.requestIdleCallback(runPrefetchBatch, { timeout: 2000 });
  } else {
    timerHandle = setTimeout(runPrefetchBatch, 1000);
  }

  return () => {
    cancelled = true;
    if (idleHandle !== null && typeof w.cancelIdleCallback === 'function') {
      w.cancelIdleCallback(idleHandle);
    }
    if (timerHandle !== null) {
      clearTimeout(timerHandle);
    }
  };
}
