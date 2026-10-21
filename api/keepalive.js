/**
 * Manual/Pro cron → ping backend /api/health (keeps Render warm).
 * Cron entry is commented out in vercel.json (Hobby plan).
 * Env: API_ORIGIN
 */
export default async function handler(req, res) {
  const apiOrigin = (process.env.API_ORIGIN || process.env.VITE_API_URL || '')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '');

  if (!apiOrigin) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: 'API_ORIGIN not set' }));
    return;
  }

  try {
    const upstream = await fetch(`${apiOrigin}/api/health`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    const body = await upstream.text();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(
      JSON.stringify({
        ok: upstream.ok,
        status: upstream.status,
        upstream: body.slice(0, 200),
        at: new Date().toISOString(),
      })
    );
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: error.message }));
  }
}
