import { getPersistentStore, savePersistentStore, fetchLiveGtaArticles } from '../lib/newsStore';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate CRON_SECRET if configured
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing CRON_SECRET' });
    }
  }

  try {
    const currentStore = getPersistentStore();
    const { articles, sourceStatus } = await fetchLiveGtaArticles();

    const nowIso = new Date().toISOString();
    const updatedStore = {
      articles: articles.length > 0 ? articles : currentStore.articles,
      lastSuccessfulRefresh: articles.length > 0 ? nowIso : currentStore.lastSuccessfulRefresh,
      sourceStatus,
      stale: articles.length === 0,
    };

    savePersistentStore(updatedStore);

    return res.status(200).json({
      success: true,
      refreshedAt: nowIso,
      articlesCount: updatedStore.articles.length,
      sourceStatus,
      stale: updatedStore.stale,
    });
  } catch (err: any) {
    console.error('[Cron Refresh News Error]:', err);
    const currentStore = getPersistentStore();
    return res.status(200).json({
      success: false,
      error: err.message || 'Unknown error during news refresh',
      articlesCount: currentStore.articles.length,
      stale: true,
      lastSuccessfulRefresh: currentStore.lastSuccessfulRefresh,
    });
  }
}
