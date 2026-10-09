import type { APIRoute } from 'astro';
import { isAdminAuthenticated } from '../../../lib/admin';
import { isStorageConfigured, uploadImage } from '../../../lib/storage';

export const prerender = false;

/**
 * POST /api/admin/upload  (multipart/form-data)
 *   file:      image file (required)
 *   bucket:    'projects' | 'essentials' (default 'projects')
 *   folder:    subfolder key prefix, sanitized (default 'uploads')
 *
 * Auth-gated: requires the admin session cookie. Returns { url } on success —
 * the admin UI pastes that URL straight into image/gallery fields.
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAdminAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!isStorageConfigured()) {
    return new Response(JSON.stringify({ error: 'Object storage is not configured on this deployment.' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Expected multipart/form-data.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return new Response(JSON.stringify({ error: 'No file provided.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const bucket = String(form.get('bucket') ?? 'projects');
  const rawFolder = String(form.get('folder') ?? 'uploads');
  const folder = rawFolder.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'uploads';

  try {
    const result = await uploadImage(bucket, folder, file);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
};
