/**
 * Authoritative Server Time Endpoint
 * Returns the true server time in UTC ISO format and epoch timestamp in milliseconds.
 * Used by the countdown system to prevent client-side time manipulation and time machine extensions.
 */
export default function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', 'application/json');

  const now = new Date();
  return res.status(200).json({
    now: now.toISOString(),
    epoch: now.getTime(),
    source: 'authoritative-server-time',
  });
}
