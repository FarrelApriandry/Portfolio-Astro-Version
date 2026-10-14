import { neon } from '@neondatabase/serverless';
import { getFallbackPortfolioData } from './fallback';

const databaseUrl = import.meta.env.DATABASE_URL ?? process.env.DATABASE_URL;

function getSql() {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined. Add it to your environment before running the app.');
  }
  return neon(databaseUrl);
}

/**
 * Tagged-template query helper (same call shape as the old `sql` export).
 * Usage stays: await query`SELECT * FROM socials WHERE id = ${id}`
 */
export async function query<T = Record<string, unknown>[]>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T> {
  const sql = getSql();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (sql as any)(strings, ...values) as Promise<T>;
}

/**
 * Back-compat for existing `await sql`...`` call sites (admin dashboard).
 * Lazily creates the client on first *call* instead of at import time,
 * so pages that only read via getPortfolioData() never crash on import
 * when DATABASE_URL is missing.
 */
export const sql = new Proxy(function () {}, {
  apply(_target, _thisArg, args: unknown[]) {
    const client = getSql() as (...a: unknown[]) => unknown;
    return client(...args);
  },
}) as <T = Record<string, unknown>[]>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T>;

export type Profile = {
  id: number;
  name: string;
  role: string;
  value_statement: string;
  status: string;
  location: string;
  email: string;
  resume: string;
};

export type Social = {
  id: number;
  profile_id: number;
  platform: string;
  url: string;
  icon: string | null;
};

export type SkillGroup = {
  id: number;
  label: string;
  items: string[];
};

export type Experience = {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
  sort_order: number;
};

export type Education = {
  id: number;
  period: string;
  institution: string;
  degree: string;
  details: string | null;
  sort_order: number;
};

export type Project = {
  id: string;
  title: string;
  year: number;
  category: string;
  role: string;
  summary: string;
  problem: string;
  solution: string;
  technologies: string[];
  image: string | null;
  alt: string;
  featured: boolean;
  links: Record<string, string> | null;
  role_responsibilities: string[];
  architecture_notes: string;
  gallery: string[];
};

export type Award = {
  id: number;
  year: number;
  title: string;
  issuer: string;
  description: string;
  link: string;
};

export type IntellectualProperty = {
  id: number;
  year: number;
  title: string;
  type: string;
  issuer: string;
  description: string;
  link: string;
};

export type Article = {
  guid: string;
  title: string;
  url: string;
  published_at: string;
  categories: string[];
  thumbnail: string | null;
  excerpt: string;
};

export async function getPortfolioData() {
  try {
    const sql = getSql();
    const [profileResult, socialsResult, skillGroupsResult, experiencesResult, educationsResult, projectsResult, awardsResult, intellectualPropertiesResult, articlesResult] = await Promise.all([
      sql`SELECT * FROM "profile" LIMIT 1`,
      sql`SELECT * FROM socials ORDER BY id ASC`,
      sql`SELECT * FROM skill_groups ORDER BY id ASC`,
      sql`SELECT * FROM experiences ORDER BY sort_order ASC`,
      sql`SELECT * FROM educations ORDER BY sort_order ASC`,
      sql`SELECT * FROM projects ORDER BY featured DESC, year DESC, title ASC`,
      sql`SELECT * FROM awards ORDER BY year DESC, id DESC`,
      sql`SELECT * FROM intellectual_properties ORDER BY year DESC, id DESC`,
      sql`SELECT guid, title, url, published_at, categories, thumbnail, excerpt FROM articles ORDER BY published_at DESC LIMIT 10`,
    ]);

    return {
      profile: (profileResult[0] as Profile | undefined) ?? null,
      socials: socialsResult as Social[],
      skillGroups: skillGroupsResult as SkillGroup[],
      experiences: experiencesResult as Experience[],
      educations: educationsResult as Education[],
      projects: projectsResult as Project[],
      awards: awardsResult as Award[],
      intellectualProperties: intellectualPropertiesResult as IntellectualProperty[],
      articles: (articlesResult as Record<string, unknown>[]).map((row) => ({
        guid: String(row.guid),
        title: String(row.title),
        url: String(row.url),
        published_at: row.published_at instanceof Date ? row.published_at.toISOString() : String(row.published_at),
        categories: (row.categories ?? []) as string[],
        thumbnail: (row.thumbnail as string | null) ?? null,
        excerpt: String(row.excerpt ?? ''),
      })) as Article[],
      degraded: false,
    };
  } catch (error) {
    console.error('[portfolio] Database unreachable, serving fallback snapshot:', error);
    return getFallbackPortfolioData();
  }
}
