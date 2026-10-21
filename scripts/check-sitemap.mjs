/**
 * Validate every <loc> in sitemap.xml:
 * - starts with https://www.
 * - returns HTTP 200 with no redirect
 *
 * Usage: node scripts/check-sitemap.mjs [https://www.ibelievethis.us/sitemap.xml]
 */
const sitemapUrl = process.argv[2] || 'https://www.ibelievethis.us/sitemap.xml';

async function checkUrl(url) {
  const res = await fetch(url, { redirect: 'manual', method: 'HEAD' });
  const status = res.status;
  const location = res.headers.get('location');
  let ok = status === 200;
  // Some hosts disallow HEAD — fall back to GET
  if (status === 405 || status === 403) {
    const getRes = await fetch(url, { redirect: 'manual' });
    ok = getRes.status === 200;
    return { url, status: getRes.status, ok, location: getRes.headers.get('location') };
  }
  return { url, status, ok: ok && !location, location };
}

async function main() {
  console.log('Fetching', sitemapUrl);
  const xmlRes = await fetch(sitemapUrl, { redirect: 'manual' });
  if (xmlRes.status >= 300 && xmlRes.status < 400) {
    console.error('Sitemap itself redirects:', xmlRes.status, xmlRes.headers.get('location'));
    process.exit(1);
  }
  const xml = await xmlRes.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  console.log(`Found ${locs.length} URLs`);

  let failed = 0;
  for (const loc of locs) {
    if (!loc.startsWith('https://www.')) {
      console.error('FAIL (not www):', loc);
      failed += 1;
      continue;
    }
    const result = await checkUrl(loc);
    if (!result.ok) {
      console.error('FAIL', result.status, loc, result.location || '');
      failed += 1;
    } else {
      console.log('OK', result.status, loc);
    }
  }

  console.log(failed ? `\n${failed} failures` : '\nAll URLs OK');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
