import type { APIRoute } from 'astro';

const UPSTREAM = 'https://github-contributions-api.jogruber.de/v4';
const USERNAME = 'FarrelApriandry';
// Upstream changes slowly (contribution history); cache at the edge for
// 6h and serve stale up to a day while revalidating in background.
const CACHE_CONTROL = 'public, s-maxage=21600, stale-while-revalidate=86400';

function isValidYear(value: string): boolean {
  if (value === 'last') return true;
  const year = Number(value);
  const now = new Date().getFullYear();
  return Number.isInteger(year) && year >= 2008 && year <= now;
}

export const GET: APIRoute = async ({ url }) => {
  const year = url.searchParams.get('y') ?? 'last';
  if (!isValidYear(year)) {
    return new Response(JSON.stringify({ error: 'Invalid year' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/${USERNAME}?y=${encodeURIComponent(year)}`, {
      headers: { 'User-Agent': 'relapri-portfolio/1.0' },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return Response.json({ contributions: [], stale: true }, { status: 502 });
  }

  if (!upstream.ok) {
    return Response.json({ contributions: [], stale: true }, { status: 502 });
  }

  const body = await upstream.text();
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_CONTROL,
    },
  });
};
