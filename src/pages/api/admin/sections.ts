import type { APIRoute } from 'astro';
import { canReadFormData, isAdminAuthenticated } from '../../../lib/admin';
import { parseJsonField, parseListField } from '../../../lib/admin';
import { sql } from '../../../lib/db';
import { isSectionKey, type SectionKey } from '../../../lib/admin-sections';

export const prerender = false;

const asText = (value: FormDataEntryValue | null) => String(value ?? '').trim();
const asNumber = (value: FormDataEntryValue | null, fallback = 0) => {
  const parsed = Number(asText(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};
const asRecordId = (value: FormDataEntryValue | null, label: string) => {
  const parsed = Number(asText(value));
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${label} is required`);
  return parsed;
};

/** section key -> page route (skill_groups + IP use friendlier URLs) */
const routes: Record<SectionKey, string> = {
  profile: '/admin',
  socials: '/admin/socials',
  skill_groups: '/admin/skill-groups',
  experiences: '/admin/experiences',
  educations: '/admin/educations',
  projects: '/admin/projects',
  awards: '/admin/awards',
  intellectual_properties: '/admin/ip',
};

/**
 * Shared POST handler for the six simple sections (everything except
 * profile and projects, which own their handlers). Same proven SQL as the
 * previous single-page dashboard; redirects back to the section page.
 */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!isAdminAuthenticated(cookies)) {
    return redirect('/admin/login', 302);
  }
  if (!canReadFormData(request)) {
    return redirect('/admin?error=Unsupported%20form%20submission', 302);
  }

  const form = await request.formData();
  const section = String(form.get('section') ?? '');
  const action = String(form.get('action') ?? 'create');
  const back = (params: string) => {
    const base = isSectionKey(section) ? routes[section] : '/admin';
    return redirect(`${base}?${params}`, 302);
  };

  try {
    switch (section) {
      case 'socials': {
        if (action === 'delete') {
          const id = asRecordId(form.get('id'), 'Social id');
          await sql`DELETE FROM socials WHERE id = ${id}`;
          break;
        }
        const platform = asText(form.get('platform'));
        const url = asText(form.get('url'));
        const icon = asText(form.get('icon')) || null;
        if (!platform || !url) throw new Error('Platform and URL are required');

        if (action === 'update') {
          const id = asRecordId(form.get('id'), 'Social id');
          await sql`UPDATE socials SET platform = ${platform}, url = ${url}, icon = ${icon} WHERE id = ${id}`;
        } else {
          await sql`INSERT INTO socials (profile_id, platform, url, icon) VALUES (1, ${platform}, ${url}, ${icon})`;
        }
        break;
      }

      case 'skill_groups': {
        if (action === 'delete') {
          const id = asRecordId(form.get('id'), 'Skill group id');
          await sql`DELETE FROM skill_groups WHERE id = ${id}`;
          break;
        }
        const label = asText(form.get('label'));
        const items = parseListField(form.get('items'));
        if (!label) throw new Error('Label is required');

        if (action === 'update') {
          const id = asRecordId(form.get('id'), 'Skill group id');
          await sql`UPDATE skill_groups SET label = ${label}, items = ${items} WHERE id = ${id}`;
        } else {
          await sql`INSERT INTO skill_groups (label, items) VALUES (${label}, ${items})`;
        }
        break;
      }

      case 'experiences': {
        if (action === 'delete') {
          const id = asRecordId(form.get('id'), 'Experience id');
          await sql`DELETE FROM experiences WHERE id = ${id}`;
          break;
        }
        const payload = {
          period: asText(form.get('period')),
          role: asText(form.get('role')),
          company: asText(form.get('company')),
          description: asText(form.get('description')),
          sort_order: asNumber(form.get('sort_order')),
        };
        if (!payload.period || !payload.role || !payload.company) {
          throw new Error('Period, role, and company are required');
        }

        if (action === 'update') {
          const id = asRecordId(form.get('id'), 'Experience id');
          await sql`
            UPDATE experiences
            SET period = ${payload.period}, role = ${payload.role}, company = ${payload.company},
                description = ${payload.description}, sort_order = ${payload.sort_order}
            WHERE id = ${id}
          `;
        } else {
          await sql`
            INSERT INTO experiences (period, role, company, description, sort_order)
            VALUES (${payload.period}, ${payload.role}, ${payload.company}, ${payload.description}, ${payload.sort_order})
          `;
        }
        break;
      }

      case 'educations': {
        if (action === 'delete') {
          const id = asRecordId(form.get('id'), 'Education id');
          await sql`DELETE FROM educations WHERE id = ${id}`;
          break;
        }
        const payload = {
          period: asText(form.get('period')),
          institution: asText(form.get('institution')),
          degree: asText(form.get('degree')),
          details: asText(form.get('details')),
          sort_order: asNumber(form.get('sort_order')),
        };
        if (!payload.period || !payload.institution || !payload.degree) {
          throw new Error('Period, institution, and degree are required');
        }

        if (action === 'update') {
          const id = asRecordId(form.get('id'), 'Education id');
          await sql`
            UPDATE educations
            SET period = ${payload.period}, institution = ${payload.institution}, degree = ${payload.degree},
                details = ${payload.details || null}, sort_order = ${payload.sort_order}
            WHERE id = ${id}
          `;
        } else {
          await sql`
            INSERT INTO educations (period, institution, degree, details, sort_order)
            VALUES (${payload.period}, ${payload.institution}, ${payload.degree}, ${payload.details || null}, ${payload.sort_order})
          `;
        }
        break;
      }

      case 'awards': {
        if (action === 'delete') {
          const id = asRecordId(form.get('id'), 'Award id');
          await sql`DELETE FROM awards WHERE id = ${id}`;
          break;
        }
        const payload = {
          year: asNumber(form.get('year'), new Date().getFullYear()),
          title: asText(form.get('title')),
          issuer: asText(form.get('issuer')),
          description: asText(form.get('description')),
          link: asText(form.get('link')),
        };
        if (!payload.title || !payload.issuer) throw new Error('Title and issuer are required');

        if (action === 'update') {
          const id = asRecordId(form.get('id'), 'Award id');
          await sql`
            UPDATE awards
            SET year = ${payload.year}, title = ${payload.title}, issuer = ${payload.issuer},
                description = ${payload.description}, link = ${payload.link || null}
            WHERE id = ${id}
          `;
        } else {
          await sql`
            INSERT INTO awards (year, title, issuer, description, link)
            VALUES (${payload.year}, ${payload.title}, ${payload.issuer}, ${payload.description}, ${payload.link || null})
          `;
        }
        break;
      }

      case 'intellectual_properties': {
        if (action === 'delete') {
          const id = asRecordId(form.get('id'), 'IP id');
          await sql`DELETE FROM intellectual_properties WHERE id = ${id}`;
          break;
        }
        const payload = {
          year: asNumber(form.get('year'), new Date().getFullYear()),
          title: asText(form.get('title')),
          type: asText(form.get('type')),
          issuer: asText(form.get('issuer')),
          description: asText(form.get('description')),
          link: asText(form.get('link')),
        };
        if (!payload.title || !payload.type || !payload.issuer) {
          throw new Error('Title, type, and issuer are required');
        }

        if (action === 'update') {
          const id = asRecordId(form.get('id'), 'IP id');
          await sql`
            UPDATE intellectual_properties
            SET year = ${payload.year}, title = ${payload.title}, type = ${payload.type}, issuer = ${payload.issuer},
                description = ${payload.description}, link = ${payload.link || null}
            WHERE id = ${id}
          `;
        } else {
          await sql`
            INSERT INTO intellectual_properties (year, title, type, issuer, description, link)
            VALUES (${payload.year}, ${payload.title}, ${payload.type}, ${payload.issuer}, ${payload.description}, ${payload.link || null})
          `;
        }
        break;
      }

      default:
        throw new Error('Unknown section');
    }

    return back(`notice=${section}:${action}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const editId = asText(form.get('id'));
    return back(`error=${encodeURIComponent(message)}${editId ? `&edit=${encodeURIComponent(editId)}` : ''}`);
  }
};
