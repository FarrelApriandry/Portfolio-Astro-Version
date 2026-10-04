import type { APIRoute } from 'astro';
import { renderResumePdf } from '../lib/resume';
import markdown from '../docs/CV.md?raw';

export const GET: APIRoute = async () => {
  const pdf = await renderResumePdf(markdown);

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Farrel-Apriandry-CV.pdf"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
