import type { APIRoute } from 'astro';
import { clearAdminAuthenticated } from '../../lib/admin';

export const GET: APIRoute = ({ cookies }) => {
  clearAdminAuthenticated(cookies);
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin/login',
    },
  });
};

export const POST: APIRoute = ({ cookies }) => {
  clearAdminAuthenticated(cookies);
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin/login',
    },
  });
};
