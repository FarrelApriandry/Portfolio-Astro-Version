import type { APIRoute } from 'astro';
import { canReadFormData, isAdminAuthenticated, parseListField } from '../../../lib/admin';
import { sql } from '../../../lib/db';

export const prerender = false;

const asText = (value: FormDataEntryValue | null) => String(value ?? '').trim();
const asNumber = (value: FormDataEntryValue | null, fallback = 0) => {
  const parsed = Number(asText(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};
const asBoolean = (value: FormDataEntryValue | null) => asText(value) === 'on';

/**
 * "Label: https://url" per line -> Record<string, string>.
 * JSON object input is still accepted for backwards compatibility.
 */
export const parseLinks = (raw: string): Record<string, string> => {
  const text = raw.trim();
  if (!text) return {};
  if (text.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        return Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, String(v)]),
        );
      }
    } catch {
      /* fall through to line parsing */
    }
  }
  const links: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const entry = line.trim();
    if (!entry) continue;
    const separator = entry.indexOf(':');
    if (separator <= 0) continue;
    const label = entry.slice(0, separator).trim();
    const url = entry.slice(separator + 1).trim();
    if (label && url) links[label] = url;
  }
  return links;
};

/** Projects CRUD — create/update/delete for projects.astro. */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!isAdminAuthenticated(cookies)) {
    return redirect('/admin/login', 302);
  }
  if (!canReadFormData(request)) {
    return redirect('/admin/projects?error=Unsupported%20form%20submission', 302);
  }

  const form = await request.formData();
  const action = String(form.get('action') ?? 'create');

  try {
    const payload = {
      title: asText(form.get('title')),
      year: asNumber(form.get('year'), new Date().getFullYear()),
      category: asText(form.get('category')),
      role: asText(form.get('role')),
      summary: asText(form.get('summary')),
      problem: asText(form.get('problem')),
      solution: asText(form.get('solution')),
      technologies: parseListField(form.get('technologies')),
      image: asText(form.get('image')),
      alt: asText(form.get('alt')),
      featured: asBoolean(form.get('featured')),
      links: parseLinks(asText(form.get('links'))),
      role_responsibilities: parseListField(form.get('role_responsibilities')),
      architecture_notes: asText(form.get('architecture_notes')),
      gallery: parseListField(form.get('gallery')),
    };

    if (!payload.title || !payload.category || !payload.role || !payload.summary) {
      throw new Error('Title, category, role, and summary are required');
    }

    if (action === 'update') {
      const projectId = asText(form.get('id'));
      if (!projectId) throw new Error('Project id is required');
      await sql`
        UPDATE projects
        SET title = ${payload.title}, year = ${payload.year}, category = ${payload.category},
            role = ${payload.role}, summary = ${payload.summary}, problem = ${payload.problem || null},
            solution = ${payload.solution || null}, technologies = ${payload.technologies},
            image = ${payload.image || null}, alt = ${payload.alt || null}, featured = ${payload.featured},
            links = ${JSON.stringify(payload.links)}, role_responsibilities = ${payload.role_responsibilities},
            architecture_notes = ${payload.architecture_notes || null}, gallery = ${payload.gallery}
        WHERE id = ${projectId}
      `;
    } else if (action === 'delete') {
      const recordId = asText(form.get('id'));
      if (!recordId) throw new Error('Project id is required');
      await sql`DELETE FROM projects WHERE id = ${recordId}`;
    } else {
      const projectId = asText(form.get('id')) || `project-${Date.now()}`;
      await sql`
        INSERT INTO projects (
          id, title, year, category, role, summary, problem, solution, technologies,
          image, alt, featured, links, role_responsibilities, architecture_notes, gallery
        )
        VALUES (
          ${projectId}, ${payload.title}, ${payload.year}, ${payload.category}, ${payload.role},
          ${payload.summary}, ${payload.problem || null}, ${payload.solution || null}, ${payload.technologies},
          ${payload.image || null}, ${payload.alt || null}, ${payload.featured}, ${JSON.stringify(payload.links)},
          ${payload.role_responsibilities}, ${payload.architecture_notes || null}, ${payload.gallery}
        )
      `;
    }

    return redirect(`/admin/projects?notice=projects:${action}`, 302);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const editId = asText(form.get('id'));
    return redirect(`/admin/projects?error=${encodeURIComponent(message)}${action === 'update' && editId ? `&edit=${encodeURIComponent(editId)}` : ''}`);
  }
};
