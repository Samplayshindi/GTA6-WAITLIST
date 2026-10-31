import { getArticlesFromDb, getMetadataFromDb, saveArticlesToDb, saveMetadataToDb } from './lib/db.ts';
import { fetchLiveGtaArticles } from './lib/newsAggregator.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let articles = await getArticlesFromDb();
    let metadata = await getMetadataFromDb();

    // If database store is completely empty, perform initial RSS fetch on demand
    if (!articles || articles.length === 0) {
      const live = await fetchLiveGtaArticles();
      if (live.articles.length > 0) {
        await saveArticlesToDb(live.articles);
        const nowIso = new Date().toISOString();
        await saveMetadataToDb({
          lastSuccessfulRefresh: nowIso,
          latestPublishedAt: live.articles[0].publishedAt,
          sourceStatus: live.sourceStatus,
          stale: false,
        });
        articles = live.articles;
        metadata = await getMetadataFromDb();
      }
    }

    const allArticles = articles || [];
    const totalCount = allArticles.length;
    const latestPublishedAt = totalCount > 0 ? allArticles[0].publishedAt : (metadata.latestPublishedAt || new Date().toISOString());

    // Parse pagination query parameters
    const limitQuery = req.query?.limit;
    const offsetQuery = req.query?.offset || req.query?.cursor;

    let paginatedArticles = allArticles;
    let hasMore = false;
    let nextCursor: number | null = null;

    if (limitQuery !== undefined) {
      const limit = Math.max(1, parseInt(String(limitQuery), 10) || 6);
      const offset = Math.max(0, parseInt(String(offsetQuery), 10) || 0);

      paginatedArticles = allArticles.slice(offset, offset + limit);
      hasMore = offset + limit < totalCount;
      nextCursor = hasMore ? offset + limit : null;
    }

    return res.status(200).json({
      articles: paginatedArticles,
      totalCount,
      hasMore,
      nextCursor,
      lastSuccessfulRefresh: metadata.lastSuccessfulRefresh || new Date().toISOString(),
      latestPublishedAt,
      sourceStatus: metadata.sourceStatus || {},
      stale: metadata.stale || false,
    });
  } catch (err: any) {
    console.error('[API /api/news Error]:', err);
    return res.status(500).json({
      error: 'Failed to retrieve stored news articles',
      details: err.message || String(err),
      articles: [],
      totalCount: 0,
      hasMore: false,
      nextCursor: null,
      lastSuccessfulRefresh: new Date().toISOString(),
      latestPublishedAt: new Date().toISOString(),
      sourceStatus: {},
      stale: true,
    });
  }
}
