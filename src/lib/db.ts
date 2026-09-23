import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.DATABASE_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined. Add it to your environment before running the app.');
}

export const sql = neon(databaseUrl);

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

export async function getPortfolioData() {
  const [profileResult, socialsResult, skillGroupsResult, experiencesResult, educationsResult, projectsResult, awardsResult, intellectualPropertiesResult] = await Promise.all([
    sql`SELECT * FROM "profile" LIMIT 1`,
    sql`SELECT * FROM socials ORDER BY id ASC`,
    sql`SELECT * FROM skill_groups ORDER BY id ASC`,
    sql`SELECT * FROM experiences ORDER BY sort_order ASC`,
    sql`SELECT * FROM educations ORDER BY sort_order ASC`,
    sql`SELECT * FROM projects ORDER BY featured DESC, year DESC, title ASC`,
    sql`SELECT * FROM awards ORDER BY year DESC, id DESC`,
    sql`SELECT * FROM intellectual_properties ORDER BY year DESC, id DESC`,
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
  };
}
