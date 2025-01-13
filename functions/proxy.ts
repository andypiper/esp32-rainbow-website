interface Env {
  // Add any environment variables here
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const request = context.request;
  // check in the cache for the request
  let cache = caches.default;
  let cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }
  
  // not in the cache, let's do the work
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  // Only allow requests to spectrumcomputing.co.uk
  if (!targetUrl.startsWith('https://spectrumcomputing.co.uk/')) {
    return new Response('Invalid target URL', { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'ESP32-Rainbow-Website/1.0'
      }
    });

    // Create a new response with CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Max-Age': '86400',
      // Copy original content type and cache control
      'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    };

    // Return the response with CORS headers
    return new Response(response.body, {
      status: response.status,
      headers: corsHeaders
    });
  } catch (error) {
    return new Response(`Proxy error: ${error}`, { status: 500 });
  }
} 