/**
 * Sync Medium articles into Neon (`articles` table).
 *
 *   node scripts/sync-medium.mjs            (local / Actions runner)
 *   MEDIUM_FEED_URL / DATABASE_URL via env (falls back to fapriandry feed)
 *
 * Idempotent: INSERT ... ON CONFLICT (guid) DO UPDATE, so re-runs only
 * touch changed rows. New rows = appeared in feed; deleted/unpublished
 * Medium posts are intentionally KEPT (archive behavior).
 *
 * Zero dependencies — regex-based RSS parsing on purpose. Medium's feed
 * shape is stable and tiny (~250KB); no XML lib needed on the runner.
 * Plain .mjs (no TS annotations) so plain `node` runs it anywhere.
 */

const FEED_URL = process.env.MEDIUM_FEED_URL ?? 'https://fapriandry.medium.com/feed';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const EXCERPT_LEN = 220;

function cdata(text) {
  return text.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').trim();
}

function tag(item, name) {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? cdata(m[1]) : '';
}

function allTags(item, name) {
  const out = [];
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'g');
  let m;
  while ((m = re.exec(item))) out.push(cdata(m[1]));
  return out;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFeed(xml) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  return items
    .map((item) => {
      const content = tag(item, 'content:encoded');
      const text = stripHtml(content);
      const imgs = [...content.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
      // Skip tracking pixels / tiny icons; first real image wins.
      const thumbnail = imgs.find((src) => !/stat|pixel|transparent|1x1/i.test(src)) ?? null;
      return {
        guid: tag(item, 'guid') || tag(item, 'link'),
        title: tag(item, 'title'),
        url: tag(item, 'link'),
        published_at: new Date(tag(item, 'pubDate')).toISOString(),
        categories: allTags(item, 'category').filter(Boolean).slice(0, 6),
        thumbnail,
        excerpt: text.length > EXCERPT_LEN ? `${text.slice(0, EXCERPT_LEN - 1).trimEnd()}…` : text,
      };
    })
    .filter((a) => a.guid && a.title && a.url);
}

const res = await fetch(FEED_URL, {
  headers: { 'user-agent': 'portfolio-medium-sync/1.0 (+github-actions)' },
});
if (!res.ok) {
  console.error(`Feed fetch failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const articles = parseFeed(await res.text());
console.log(`feed: ${articles.length} item(s)`);

let neon;
try {
  ({ neon } = await import('@neondatabase/serverless'));
} catch {
  console.error('Missing @neondatabase/serverless — run `npm install` first.');
  process.exit(1);
}
const sql = neon(DATABASE_URL);

let inserted = 0;
let updated = 0;
for (const a of articles) {
  const rows = await sql`
    INSERT INTO articles (guid, title, url, published_at, categories, thumbnail, excerpt, synced_at)
    VALUES (${a.guid}, ${a.title}, ${a.url}, ${a.published_at}, ${a.categories}, ${a.thumbnail}, ${a.excerpt}, now())
    ON CONFLICT (guid) DO UPDATE SET
      title = EXCLUDED.title,
      url = EXCLUDED.url,
      published_at = EXCLUDED.published_at,
      categories = EXCLUDED.categories,
      thumbnail = EXCLUDED.thumbnail,
      excerpt = EXCLUDED.excerpt,
      synced_at = now()
    RETURNING (xmax = 0) AS inserted
  `;
  if (rows[0]?.inserted) inserted++;
  else updated++;
}

console.log(`done: +${inserted} new, ~${updated} updated`);
