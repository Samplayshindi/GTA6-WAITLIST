import { apiUrl } from './api';
import { INITIAL_NEWS_ARTICLES } from '../data/newsData';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: 'official' | 'release' | 'gameplay' | 'trailers' | 'leaks';
  isUnconfirmed: boolean;
  thumbnailUrl?: string;
}

export interface FetchNewsResult {
  articles: NewsArticle[];
  totalCount: number;
  hasMore: boolean;
  nextCursor: number | null;
  lastSuccessfulRefresh: string;
  latestPublishedAt: string;
  sourceStatus: Record<string, 'ok' | 'error'>;
  stale: boolean;
}

interface CachedNewsEntry {
  result: FetchNewsResult;
  timestamp: number;
}

const NEWS_CACHE_TTL_MS = 60 * 1000;
let cachedFullPool: NewsArticle[] = [];
let cachedMeta: Omit<FetchNewsResult, 'articles'> | null = null;
const cachedPageMap = new Map<string, CachedNewsEntry>();

export function getCachedNewsArticles(limit?: number, offset = 0): FetchNewsResult | null {
  const key = `${limit ?? 'all'}:${offset}`;
  const exact = cachedPageMap.get(key);
  if (exact && Date.now() - exact.timestamp < NEWS_CACHE_TTL_MS * 5) {
    return exact.result;
  }
  if (cachedFullPool.length > 0 && cachedMeta && offset === 0) {
    const count = limit ?? cachedFullPool.length;
    return {
      ...cachedMeta,
      articles: cachedFullPool.slice(0, count),
      hasMore: cachedFullPool.length < cachedMeta.totalCount || count < cachedFullPool.length,
    };
  }
  return null;
}

export async function getNewsArticles(limit?: number, offset?: number): Promise<FetchNewsResult> {
  try {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', String(limit));
    if (offset !== undefined) params.append('offset', String(offset));

    const queryString = params.toString();
    const endpoint = queryString ? apiUrl(`/api/news?${queryString}`) : apiUrl('/api/news');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
    });
    clearTimeout(timeout);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data.articles) && data.articles.length > 0) {
        const sortedArticles = [...data.articles].sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        const result: FetchNewsResult = {
          articles: sortedArticles,
          totalCount: typeof data.totalCount === 'number' ? data.totalCount : sortedArticles.length,
          hasMore: Boolean(data.hasMore),
          nextCursor: data.nextCursor !== undefined ? data.nextCursor : null,
          lastSuccessfulRefresh: data.lastSuccessfulRefresh || new Date().toISOString(),
          latestPublishedAt: data.latestPublishedAt || (sortedArticles.length > 0 ? sortedArticles[0].publishedAt : new Date().toISOString()),
          sourceStatus: data.sourceStatus || {},
          stale: Boolean(data.stale)
        };

        const cacheKey = `${limit ?? 'all'}:${offset ?? 0}`;
        cachedPageMap.set(cacheKey, { result, timestamp: Date.now() });
        if ((offset ?? 0) === 0 && sortedArticles.length >= cachedFullPool.length) {
          cachedFullPool = sortedArticles;
          const { articles: _ignored, ...meta } = result;
          cachedMeta = meta;
        }

        return result;
      }
    }
  } catch (err) {
    console.warn('[NewsService] Request to /api/news failed, using authenticated fallback data:', err);
  }

  // Fallback to static articles sorted newest first
  const fallbackSorted = [...INITIAL_NEWS_ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const start = offset || 0;
  const count = limit || fallbackSorted.length;
  const sliced = fallbackSorted.slice(start, start + count);

  return {
    articles: sliced,
    totalCount: fallbackSorted.length,
    hasMore: start + count < fallbackSorted.length,
    nextCursor: start + count < fallbackSorted.length ? start + count : null,
    lastSuccessfulRefresh: new Date().toISOString(),
    latestPublishedAt: fallbackSorted[0]?.publishedAt || new Date().toISOString(),
    sourceStatus: { 'Static Cache': 'ok' },
    stale: true,
  };
}
