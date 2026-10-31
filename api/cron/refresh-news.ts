import { fetchLiveGtaArticles } from '../lib/newsAggregator.ts';
import { saveArticlesToDb, saveMetadataToDb, getArticlesFromDb, getMetadataFromDb, getDbConnectionInfo } from '../lib/db.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-vercel-cron');
  res.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Cron Security: Validate CRON_SECRET if present or check x-vercel-cron header
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers['x-vercel-cron'] === '1';

  if (cronSecret && !isVercelCron) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or missing CRON_SECRET authorization header'
      });
    }
  }

  const nowIso = new Date().toISOString();

  try {
    const { articles, sourceStatus } = await fetchLiveGtaArticles();
    const dbInfo = getDbConnectionInfo();

    let latestPubDate = nowIso;
    if (articles.length > 0) {
      latestPubDate = articles[0].publishedAt;
      await saveArticlesToDb(articles);
    }

    const currentArticles = await getArticlesFromDb();
    const hasArticles = currentArticles.length > 0;
    const finalLatestPub = hasArticles ? currentArticles[0].publishedAt : latestPubDate;

    await saveMetadataToDb({
      lastSuccessfulRefresh: articles.length > 0 ? nowIso : (await getMetadataFromDb()).lastSuccessfulRefresh,
      latestPublishedAt: finalLatestPub,
      sourceStatus,
      lastCronExecution: nowIso,
      stale: articles.length === 0 && !hasArticles
    });

    return res.status(200).json({
      success: true,
      lastCronExecution: nowIso,
      lastSuccessfulRefresh: articles.length > 0 ? nowIso : (await getMetadataFromDb()).lastSuccessfulRefresh,
      latestPublishedAt: finalLatestPub,
      fetchedCount: articles.length,
      storedTotal: currentArticles.length,
      database: dbInfo,
      sourceStatus,
      stale: articles.length === 0
    });
  } catch (err: any) {
    console.error('[Cron News Refresh Error]:', err);
    await saveMetadataToDb({
      lastCronExecution: nowIso,
      lastCronError: err.message || String(err),
      stale: true
    });

    return res.status(500).json({
      success: false,
      error: err.message || 'Error occurred during scheduled news refresh',
      lastCronExecution: nowIso,
      stale: true
    });
  }
}
