import { getDbConnectionInfo, getArticlesFromDb, getMetadataFromDb } from '../lib/db.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Security Protection: Validate auth token or key
  const cronSecret = process.env.CRON_SECRET || process.env.DIAGNOSTIC_SECRET || 'gta6-diag-auth-key';
  const authHeader = req.headers['authorization'];
  const urlKey = req.query?.key || req.query?.secret;

  const isAuthorized = 
    (authHeader && authHeader === `Bearer ${cronSecret}`) ||
    (urlKey && urlKey === cronSecret) ||
    (!process.env.CRON_SECRET && !process.env.DIAGNOSTIC_SECRET); // Allowed in preview if secrets unconfigured

  if (!isAuthorized) {
    return res.status(401).json({
      error: 'Unauthorized access to diagnostic endpoint',
      hint: 'Provide Authorization: Bearer <CRON_SECRET> header or ?key=<CRON_SECRET> parameter'
    });
  }

  try {
    const dbInfo = getDbConnectionInfo();
    const articles = await getArticlesFromDb();
    const metadata = await getMetadataFromDb();

    return res.status(200).json({
      diagnosticStatus: 'ok',
      timestamp: new Date().toISOString(),
      cron: {
        endpoint: '/api/cron/refresh-news',
        configuredSchedule: '*/15 * * * *',
        isCronSecretConfigured: Boolean(process.env.CRON_SECRET),
        lastCronExecution: metadata.lastCronExecution || null,
        lastCronError: metadata.lastCronError || null
      },
      refresh: {
        lastSuccessfulRefresh: metadata.lastSuccessfulRefresh || null,
        latestPublishedAt: articles.length > 0 ? articles[0].publishedAt : (metadata.latestPublishedAt || null),
        stale: metadata.stale || false
      },
      database: {
        provider: dbInfo.provider,
        isConfigured: dbInfo.isConfigured,
        missingEnvVars: dbInfo.isConfigured ? [] : dbInfo.missingEnvVars,
        storedArticlesCount: articles.length
      },
      sourceStatus: metadata.sourceStatus || {},
      sampleLatestArticle: articles.length > 0 ? {
        id: articles[0].id,
        title: articles[0].title,
        source: articles[0].source,
        publishedAt: articles[0].publishedAt,
        url: articles[0].url
      } : null
    });
  } catch (err: any) {
    return res.status(500).json({
      diagnosticStatus: 'error',
      timestamp: new Date().toISOString(),
      error: err.message || String(err)
    });
  }
}
