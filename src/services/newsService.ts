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
  lastSuccessfulRefresh: string;
  latestPublishedAt: string;
  sourceStatus: Record<string, 'ok' | 'error'>;
  stale: boolean;
}

export async function getNewsArticles(): Promise<FetchNewsResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/news', {
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
      if (Array.isArray(data.articles)) {
        // Sort strictly newest first by publication timestamp
        const sortedArticles = [...data.articles].sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        return {
          articles: sortedArticles,
          lastSuccessfulRefresh: data.lastSuccessfulRefresh || new Date().toISOString(),
          latestPublishedAt: data.latestPublishedAt || (sortedArticles.length > 0 ? sortedArticles[0].publishedAt : new Date().toISOString()),
          sourceStatus: data.sourceStatus || {},
          stale: Boolean(data.stale)
        };
      }
    }
  } catch (err) {
    console.warn('[NewsService] Request to /api/news failed:', err);
  }

  return {
    articles: [],
    lastSuccessfulRefresh: new Date().toISOString(),
    latestPublishedAt: new Date().toISOString(),
    sourceStatus: {},
    stale: true,
  };
}
