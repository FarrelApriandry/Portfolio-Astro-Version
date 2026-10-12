/**
 * Admin image upload — progressively enhances every .image-upload component
 * on the page. Cover variant: single image, replace on new upload.
 * Gallery variant: ordered thumbnails with add/remove.
 *
 * Loaded via <script> in Astro = bundled, type-checked, deferred by default.
 */

type UploadJson = { url?: string; error?: string };

/**
 * Client-side compression: resize + convert to WebP before upload.
 * Max 1600px on the long side, WebP quality 82 — a 1.5MB PNG screenshot
 * typically lands around 150-250KB. Runs here (not on the server) because
 * the admin UI has exactly one user, so no compat farm to worry about.
 *
 * GIFs pass through untouched (converting would kill the animation), and
 * anything this browser can't decode (e.g. AVIF on older builds) falls
 * back to the original file — the server still accepts it as-is.
 */
const MAX_SIDE = 1600;
const WEBP_QUALITY = 0.82;

async function compressImage(file: File): Promise<File> {
  if (file.type === 'image/gif') return file;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const targetW = Math.max(1, Math.round(bitmap.width * scale));
    const targetH = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);

    const base =
      (file.name.replace(/\.[^.]+$/, '') || 'image')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48) || 'image';

    const toBlob = (type: string, quality: number): Promise<Blob | null> =>
      new Promise((resolve) => canvas.toBlob(resolve, type, quality));

    const webp = await toBlob('image/webp', WEBP_QUALITY);
    if (webp && webp.size > 0 && webp.type === 'image/webp') {
      return new File([webp], `${base}.webp`, { type: 'image/webp' });
    }
    // Fallback for browsers that can't encode WebP (old Safari) — JPEG.
    const jpeg = await toBlob('image/jpeg', 0.85);
    if (jpeg && jpeg.size > 0) {
      return new File([jpeg], `${base}.jpg`, { type: 'image/jpeg' });
    }
    return file;
  } finally {
    bitmap.close();
  }
}

function initUploadComponent(root: HTMLElement): void {
  const variant = (root.dataset.variant ?? 'cover') as 'cover' | 'gallery';
  const bucket = root.dataset.bucket ?? 'projects';
  const folder = root.dataset.folder ?? 'uploads';

  const hidden = root.querySelector<HTMLInputElement>('input[type="hidden"]')!;
  const dropzone = root.querySelector<HTMLElement>('.dropzone')!;
  const previews = root.querySelector<HTMLElement>('.previews')!;
  const status = root.querySelector<HTMLElement>('.status')!;
  const urlInput = root.querySelector<HTMLInputElement>('.url-input')!;

  let urls: string[] = hidden.value ? hidden.value.split(',').filter(Boolean) : [];
  let busy = false;

  const setStatus = (text: string, kind: 'info' | 'error' | 'ok' = 'info') => {
    status.textContent = text;
    status.classList.remove('hidden', 'text-[#8a8a8a]', 'text-[#fca5a5]', 'text-[#baf3cf]');
    status.classList.add(kind === 'error' ? 'text-[#fca5a5]' : kind === 'ok' ? 'text-[#baf3cf]' : 'text-[#8a8a8a]');
  };

  const sync = () => {
    hidden.value = urls.join(',');
    if (urls.length === 0) {
      previews.classList.add('hidden');
      previews.replaceChildren();
    } else {
      previews.classList.remove('hidden');
    }
  };

  const render = () => {
    previews.replaceChildren();

    if (variant === 'cover') {
      if (urls.length === 0) return;
      const wrap = document.createElement('div');
      wrap.className = 'flex flex-wrap items-start gap-4';

      const img = document.createElement('img');
      img.src = urls[0];
      img.alt = 'Selected image preview';
      img.className = 'h-36 w-full rounded-lg border border-[#2E2E2E] object-cover sm:w-64';

      const actions = document.createElement('div');
      actions.className = 'flex flex-col gap-2';

      const replace = document.createElement('button');
      replace.type = 'button';
      replace.textContent = 'Replace';
      replace.className =
        'min-h-[40px] rounded-lg border border-[#2E2E2E] px-4 text-sm text-[#F5F5F5] transition-colors hover:bg-[#161616]';
      replace.addEventListener('click', () => fileInput.click());

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.className =
        'min-h-[40px] rounded-lg border border-[#3f1f1f] px-4 text-sm text-[#fca5a5] transition-colors hover:bg-[#1b0f0f]';
      remove.addEventListener('click', () => {
        urls = [];
        sync();
        render();
      });

      actions.append(replace, remove);
      wrap.append(img, actions);
      previews.append(wrap);
      return;
    }

    // Gallery variant — thumbnail grid with remove buttons
    urls.forEach((url) => {
      const cell = document.createElement('div');
      cell.className = 'relative overflow-hidden rounded-lg border border-[#2E2E2E]';

      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Gallery image';
      img.className = 'h-28 w-full object-cover';

      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = '×';
      del.setAttribute('aria-label', 'Remove image');
      del.className =
        'absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-lg leading-none text-white transition-colors hover:bg-[#3f1f1f]';
      del.addEventListener('click', () => {
        urls = urls.filter((existing) => existing !== url);
        sync();
        render();
      });

      cell.append(img, del);
      previews.append(cell);
    });

    if (urls.length > 0) {
      previews.className = 'previews mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3';
    }
  };

  const showStatusWhile = async (text: string, job: () => Promise<void>) => {
    setStatus(text);
    try {
      await job();
    } finally {
      status.classList.add('hidden');
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; note: string }> => {
    const optimized = await compressImage(file);
    const body = new FormData();
    body.append('file', optimized);
    body.append('bucket', bucket);
    body.append('folder', folder);
    const response = await fetch('/api/admin/upload', { method: 'POST', body });
    const payload = (await response.json().catch(() => ({}))) as UploadJson;
    if (!response.ok || !payload.url) {
      throw new Error(payload.error ?? `Upload failed (${response.status})`);
    }
    const fmt = (bytes: number) =>
      bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
    const note =
      optimized !== file
        ? `${file.name} (${fmt(file.size)} → ${fmt(optimized.size)})`
        : file.name;
    return { url: payload.url, note };
  };

  const handleFiles = async (files: FileList | File[]): Promise<void> => {
    if (busy) return;
    const list = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (list.length === 0) {
      setStatus('Not an image file.', 'error');
      return;
    }
    busy = true;
    try {
      for (const file of list) {
        await showStatusWhile(`Uploading ${file.name}…`, async () => {
          const { url, note } = await uploadFile(file);
          urls = variant === 'gallery' ? [...urls, url] : [url];
          sync();
          render();
          setStatus(`Done: ${note}`, 'ok');
        });
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed.', 'error');
    } finally {
      busy = false;
    }
  };

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  if (variant === 'gallery') fileInput.multiple = true;
  fileInput.hidden = true;
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files?.length) handleFiles(fileInput.files);
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach((type) =>
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      root.classList.add('drop-active');
    }),
  );
  ['dragleave', 'drop'].forEach((type) =>
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      root.classList.remove('drop-active');
    }),
  );
  dropzone.addEventListener('drop', (event) => {
    if (event.dataTransfer?.files.length) handleFiles(event.dataTransfer.files);
  });

  urlInput.addEventListener('change', () => {
    const url = urlInput.value.trim();
    if (!url) return;
    urls = variant === 'gallery' ? [...urls, url] : [url];
    urlInput.value = '';
    sync();
    render();
  });

  sync();
  render();
}

function initAdminUploads(): void {
  document.querySelectorAll<HTMLElement>('.image-upload').forEach((root) => {
    if (!root.dataset.enhanced) {
      root.dataset.enhanced = '1';
      initUploadComponent(root);
    }
  });
}

initAdminUploads();

// Re-scan after Astro view transitions, if any are enabled later.
document.addEventListener('astro:page-load', initAdminUploads);
