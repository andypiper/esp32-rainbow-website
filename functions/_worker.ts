import { onRequest } from './proxy';

export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);
    
    // Route requests to the appropriate handler
    if (url.pathname === '/proxy') {
      return onRequest({ request, env, ctx });
    }

    return new Response('Not found', { status: 404 });
  }
}; 