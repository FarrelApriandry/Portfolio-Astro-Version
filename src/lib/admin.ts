import type { AstroCookies } from 'astro';

export const ADMIN_EMAIL = 'relapri@admin.id';
export const ADMIN_PASSWORD = 'jambon06';

export function isAdminAuthenticated(cookies: AstroCookies) {
  return cookies.get('portfolio_admin_session')?.value === 'authenticated';
}

export function setAdminAuthenticated(cookies: AstroCookies) {
  cookies.set('portfolio_admin_session', 'authenticated', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: false,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminAuthenticated(cookies: AstroCookies) {
  cookies.delete('portfolio_admin_session', { path: '/' });
}

export function parseListField(value: FormDataEntryValue | null, delimiter = ',') {
  return String(value ?? '')
    .split(delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseJsonField(value: FormDataEntryValue | null) {
  const raw = String(value ?? '').trim();
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function canReadFormData(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  return contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');
}
