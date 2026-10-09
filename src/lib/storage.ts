import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Neon Object Storage — S3-compatible endpoint configured via .env (see .env.example):
 *   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_ENDPOINT_URL_S3 / AWS_REGION
 * Buckets declared in neon.ts: `projects` (public_read) and `essentials` (public_read).
 */
const BUCKETS = new Set(['projects', 'essentials']);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB — enough for hero + gallery shots
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

// Static env keys — Vite's module runner rejects dynamic `import.meta.env[name]`
// access, so each key must be referenced statically and read at module init.
const ENV = {
  AWS_ACCESS_KEY_ID: import.meta.env.AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: import.meta.env.AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY,
  AWS_ENDPOINT_URL_S3: import.meta.env.AWS_ENDPOINT_URL_S3 ?? process.env.AWS_ENDPOINT_URL_S3,
  AWS_REGION: import.meta.env.AWS_REGION ?? process.env.AWS_REGION,
} as const;

export function isStorageConfigured(): boolean {
  return Boolean(ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY && ENV.AWS_ENDPOINT_URL_S3);
}

export type UploadResult = { url: string; key: string; bucket: string };

export async function uploadImage(
  bucket: string,
  folder: string,
  file: File,
): Promise<UploadResult> {
  const endpoint = ENV.AWS_ENDPOINT_URL_S3;
  const region = ENV.AWS_REGION || 'auto';

  if (!endpoint) throw new Error('Object storage is not configured on this deployment.');
  if (!BUCKETS.has(bucket)) throw new Error(`Unknown bucket: ${bucket}`);

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error('Unsupported file type. Use JPG, PNG, WebP, AVIF, or GIF.');
  if (file.size === 0) throw new Error('File is empty.');
  if (file.size > MAX_BYTES) throw new Error('File is too large. Maximum size is 8 MB.');

  const bytes = Buffer.from(await file.arrayBuffer());
  const nameBase = (file.name.replace(/\.[^.]+$/, '') || 'image')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'image';
  const key = `${folder}/${Date.now()}-${nameBase}.${ext}`;

  const client = new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: ENV.AWS_ACCESS_KEY_ID!,
      secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY!,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: file.type,
    }),
  );

  const publicBase = `${endpoint.replace(/\/$/, '')}/${bucket}`;
  return { url: `${publicBase}/${key}`, key, bucket };
}
