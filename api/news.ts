import { getPersistentStore, fetchLiveGtaArticles, savePersistentStore } from './lib/newsStore';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // If POST request, trigger an on-demand background/immediate fetch
  if (req.method === 'POST') {
    try {
      const { articles, sourceStatus } = await fetchLiveGtaArticles();
      const store = getPersistentStore();
      const nowIso = new Date().toISOString();
      const updated = {
        articles: articles.length > 0 ? articles : store.articles,
        lastSuccessfulRefresh: articles.length > 0 ? nowIso : store.lastSuccessfulRefresh,
        sourceStatus,
        stale: articles.length === 0,
      };
      savePersistentStore(updated);
      return res.status(200).json({
        articles: updated.articles,
        lastSuccessfulRefresh: updated.lastSuccessfulRefresh,
        sourceStatus: updated.sourceStatus,
        stale: updated.stale,
      });
    } catch {
      // fall through to get store
    }
  }

  try {
    const store = getPersistentStore();
    return res.status(200).json({
      articles: store.articles,
      lastSuccessfulRefresh: store.lastSuccessfulRefresh,
      sourceStatus: store.sourceStatus || {},
      stale: store.stale || false,
    });
  } catch (err: any) {
    const store = getPersistentStore();
    return res.status(200).json({
      articles: store.articles,
      lastSuccessfulRefresh: store.lastSuccessfulRefresh,
      sourceStatus: store.sourceStatus || {},
      stale: true,
    });
  }
}
