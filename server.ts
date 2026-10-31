import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import newsHandler from './api/news.ts';
import cronHandler from './api/cron/refresh-news.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Forward /api/news to the serverless handler
app.all('/api/news', async (req: Request, res: Response) => {
  try {
    await newsHandler(req, res);
  } catch (err) {
    console.error('Error in news handler:', err);
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
} );

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
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GTA VI Countdown Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
