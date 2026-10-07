import { createHmac, scrypt, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

// ---------------------------------------------------------------------------
// Admin auth — env-based credentials, scrypt password hash, HMAC session.
// Required env vars (see .env.example):
//   ADMIN_EMAIL           login identifier
//   ADMIN_PASSWORD_HASH   scrypt hash, generated via `node scripts/gen-admin-hash.mjs`
//   ADMIN_SESSION_SECRET  long random secret for signing session cookies
// ---------------------------------------------------------------------------

const SESSION_COOKIE = 'portfolio_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;

function getEnv(name: string): string | undefined {
  const viaMeta = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env?.[name];
  if (typeof viaMeta === 'string' && viaMeta.length > 0) return viaMeta;
  const viaProcess = typeof process !== 'undefined' ? process.env[name] : undefined;
  return viaProcess || undefined;
}

export function isAdminConfigured(): boolean {
  return Boolean(getEnv('ADMIN_EMAIL') && getEnv('ADMIN_PASSWORD_HASH') && getEnv('ADMIN_SESSION_SECRET'));
}

function scryptAsync(password: string, salt: Buffer, keylen: number, options: { N: number; r: number; p: number }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derived) => {
      if (err) reject(err);
      else resolve(derived as Buffer);
    });
  });
}

/**
 * Hash format: scrypt:N:r:p:saltHex:keyHex (colon-separated on purpose —
 * `$` separators get mangled by dotenv variable expansion in .env files).
 * Produced by `node scripts/gen-admin-hash.mjs "<password>"`.
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = getEnv('ADMIN_EMAIL');
  const expectedHash = getEnv('ADMIN_PASSWORD_HASH');
  if (!expectedEmail || !expectedHash || !email || !password) return false;

  const emailOk =
    email.length === expectedEmail.length &&
    timingSafeEqual(Buffer.from(email), Buffer.from(expectedEmail));

  const parts = expectedHash.split(':');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, nStr, rStr, pStr, saltHex, keyHex] = parts;
  const N = Number(nStr);
  const r = Number(rStr);
  const p = Number(pStr);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

  let passwordOk = false;
  try {
    const expected = Buffer.from(keyHex, 'hex');
    const derived = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length, { N, r, p });
    passwordOk = derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    passwordOk = false;
  }

  return emailOk && passwordOk;
}

function signSession(payload: string): string {
  const secret = getEnv('ADMIN_SESSION_SECRET') ?? '';
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function isAdminAuthenticated(cookies: AstroCookies): boolean {
  const raw = cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return false;
  // Format: <expires>.<signature> — split from the right so nothing
  // in the payload can break parsing.
  const dot = raw.lastIndexOf('.');
  if (dot <= 0) return false;
  const expiresStr = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  const expectedEmail = getEnv('ADMIN_EMAIL');
  if (!expectedEmail) return false;

  const expectedSig = signSession(`${expectedEmail}.${expiresStr}`);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  return sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);
}

export function setAdminAuthenticated(cookies: AstroCookies): void {
  const email = getEnv('ADMIN_EMAIL') ?? '';
  const expires = String(Date.now() + SESSION_TTL_SECONDS * 1000);
  const signature = signSession(`${email}.${expires}`);
  cookies.set(SESSION_COOKIE, `${expires}.${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // Local dev runs over plain http where `secure` cookies are dropped;
    // production (Vercel) is always https.
    secure: import.meta.env.PROD,
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearAdminAuthenticated(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

// --- Login rate limiting (best-effort, per instance) ------------------------

const loginAttempts = new Map<string, number[]>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const attempts = (loginAttempts.get(ip) ?? []).filter((t) => now - t < LOGIN_WINDOW_MS);
  loginAttempts.set(ip, attempts);
  if (attempts.length >= LOGIN_MAX_ATTEMPTS) {
    const oldest = attempts[0] ?? now;
    return { allowed: false, retryAfterSeconds: Math.ceil((oldest + LOGIN_WINDOW_MS - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const attempts = (loginAttempts.get(ip) ?? []).filter((t) => now - t < LOGIN_WINDOW_MS);
  attempts.push(now);
  loginAttempts.set(ip, attempts);
}

export function parseListField(value: FormDataEntryValue | null, delimiter = ','): string[] {
  return String(value ?? '')
    .split(delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseJsonField(value: FormDataEntryValue | null): Record<string, unknown> {
  const raw = String(value ?? '').trim();
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function canReadFormData(request: Request): boolean {
  const contentType = request.headers.get('content-type') ?? '';
  return contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');
}
