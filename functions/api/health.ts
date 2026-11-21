import { PagesFunction, jsonResponse, handleOptions } from './_utils';

export const onRequestOptions: PagesFunction = async ({ request, env }) => {
  return handleOptions(request, env);
};

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  return jsonResponse({ ok: true, status: 'healthy' }, 200, { 'Cache-Control': 'no-store' }, request, env);
};

