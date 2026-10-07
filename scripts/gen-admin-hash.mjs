#!/usr/bin/env node
// Generate an ADMIN_PASSWORD_HASH for .env / Vercel env vars.
// Usage: node scripts/gen-admin-hash.mjs "<new-password>"
import { randomBytes, scrypt } from 'node:crypto';

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: node scripts/gen-admin-hash.mjs "<password-min-12-chars>"');
  process.exit(1);
}

const N = 16384;
const r = 8;
const p = 1;
const salt = randomBytes(16);

scrypt(password, salt, 64, { N, r, p }, (err, derived) => {
  if (err) throw err;
  console.log(`ADMIN_PASSWORD_HASH=scrypt:${N}:${r}:${p}:${salt.toString('hex')}:${derived.toString('hex')}`);
  console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString('hex')}`);
});
