import type { APIRoute } from 'astro';
import { canReadFormData, isAdminAuthenticated } from '../../../lib/admin';
import { sql } from '../../../lib/db';

export const prerender = false;

const asText = (value: FormDataEntryValue | null) => String(value ?? '').trim();

/** Profile is a single-row upsert — POST target for the overview page form. */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!isAdminAuthenticated(cookies)) {
    return redirect('/admin/login', 302);
  }
  if (!canReadFormData(request)) {
    return redirect('/admin?error=Unsupported%20form%20submission', 302);
  }

  const form = await request.formData();
  const payload = {
    name: asText(form.get('name')),
    role: asText(form.get('role')),
    value_statement: asText(form.get('value_statement')),
    status: asText(form.get('status')),
    location: asText(form.get('location')),
    email: asText(form.get('email')),
    resume: asText(form.get('resume')),
  };

  try {
    if (!payload.name || !payload.role) throw new Error('Name and role are required');

    const existing = await sql`SELECT id FROM "profile" LIMIT 1`;
    if (existing.length > 0) {
      await sql`
        UPDATE "profile"
        SET name = ${payload.name}, role = ${payload.role}, value_statement = ${payload.value_statement},
            status = ${payload.status}, location = ${payload.location}, email = ${payload.email}, resume = ${payload.resume}
        WHERE id = ${existing[0].id}
      `;
    } else {
      await sql`
        INSERT INTO "profile" (name, role, value_statement, status, location, email, resume)
        VALUES (${payload.name}, ${payload.role}, ${payload.value_statement}, ${payload.status}, ${payload.location}, ${payload.email}, ${payload.resume})
      `;
    }
    return redirect('/admin?notice=profile:update', 302);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return redirect(`/admin?error=${encodeURIComponent(message)}`, 302);
  }
};
