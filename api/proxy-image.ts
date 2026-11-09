import type { Request, Response } from 'express';

export default async function handler(req: any, res: any) {
  const targetUrl = req.query?.url as string | undefined;

  // Handle CORS Preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing required "url" query parameter' });
  }

  try {
    const decodedUrl = decodeURIComponent(targetUrl);
    const parsedUrl = new URL(decodedUrl);

    // Only allow HTTP/HTTPS proxying
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ error: 'Invalid URL protocol' });
    }

    const fetchOptions: RequestInit = {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': `${parsedUrl.protocol}//${parsedUrl.hostname}/`,
      },
    };

    const targetRes = await fetch(decodedUrl, fetchOptions);

    if (!targetRes.ok) {
      return res.status(targetRes.status).json({
        error: `Target server returned HTTP ${targetRes.status}`,
        url: decodedUrl,
      });
    }

    const contentType = targetRes.headers.get('content-type') || 'image/jpeg';
    const buffer = await targetRes.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Length', buffer.byteLength.toString());

    return res.status(200).send(Buffer.from(buffer));
  } catch (err: any) {
    console.error('[Proxy Image Error]:', err);
    return res.status(502).json({
      error: 'Failed to proxy image resource',
      details: err.message || String(err),
    });
  }
}
