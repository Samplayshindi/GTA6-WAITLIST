import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import newsHandler from './api/news.ts';
import cronHandler from './api/cron/refresh-news.ts';
import diagHandler from './api/admin/news-status.ts';
import soundtrackHandler from './api/soundtrack.ts';
import proxyImageHandler from './api/proxy-image.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// Cross-origin requests from the GitHub Pages frontend to the Render API.
app.use((req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

const setOptimizedImageHeaders = (res: Response, filePath: string) => {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.avif')) {
    res.setHeader('Content-Type', 'image/avif');
    res.setHeader('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
  } else if (lower.endsWith('.webp')) {
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
  } else if (/\.(svg|png|jpe?g|ico|gif)$/i.test(lower)) {
    res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
  }
};

app.use(
  express.static(path.resolve(__dirname, 'public'), {
    setHeaders: setOptimizedImageHeaders,
  })
);

// Return 404 immediately for any missing optimized image so Vite/SPA never returns 200 text/html
app.use('/optimized-images', (_req: Request, res: Response) => {
  res.status(404).end();
});

// Forward /api/proxy-image to the image proxy handler
app.all('/api/proxy-image', async (req: Request, res: Response) => {
  try {
    await proxyImageHandler(req, res);
  } catch (err) {
    console.error('Error in proxy image handler:', err);
    res.status(500).json({ error: 'Proxy Server Error' });
  }
});

// Forward /api/news to the serverless handler
app.all('/api/news', async (req: Request, res: Response) => {
  try {
    await newsHandler(req, res);
  } catch (err) {
    console.error('Error in news handler:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Forward /api/soundtrack to the soundtrack handler
app.all('/api/soundtrack', async (req: Request, res: Response) => {
  try {
    await soundtrackHandler(req, res);
  } catch (err) {
    console.error('Error in soundtrack handler:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Forward /api/cron/refresh-news to the cron handler
app.all('/api/cron/refresh-news', async (req: Request, res: Response) => {
  try {
    await cronHandler(req, res);
  } catch (err) {
    console.error('Error in cron refresh handler:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Diagnostic endpoint
app.all('/api/admin/news-status', async (req: Request, res: Response) => {
  try {
    await diagHandler(req, res);
  } catch (err) {
    console.error('Error in diagnostic handler:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/news/refresh', async (req: Request, res: Response) => {
  try {
    req.method = 'POST';
    await newsHandler(req, res);
  } catch (err) {
    console.error('Error refreshing news:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Authoritative server time endpoint to defeat time machine extensions
app.get('/api/time', (_req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const now = new Date();
  res.json({
    now: now.toISOString(),
    epoch: now.getTime(),
    source: 'authoritative-server-time',
  });
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        setHeaders: setOptimizedImageHeaders,
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GTA VI Countdown Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
