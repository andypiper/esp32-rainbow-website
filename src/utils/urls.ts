export const SPECTRUM_COMPUTING_BASE_URL = 'https://spectrumcomputing.co.uk';
// Development settings
const isDevelopment = import.meta.env.DEV;
const DEV_PROXY_URL = 'http://localhost:8787/proxy';

// Add cache duration constant
export const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function ensureBaseUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${SPECTRUM_COMPUTING_BASE_URL}${url}`;
}

export function getProxyUrl(url: string): string {
  if (isDevelopment) {
    return `${DEV_PROXY_URL}?url=${encodeURIComponent(ensureBaseUrl(url))}`;
  }
  return `/proxy?url=${encodeURIComponent(ensureBaseUrl(url))}`;
}

export function getFilenameFromUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

// Add fetchWithCache function
export async function fetchWithCache<T>(
  url: string, 
  cacheName: string = 'games-cache',
  signal?: AbortSignal
): Promise<T> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(url);

  if (cachedResponse) {
    const data = await cachedResponse.json();
    const cacheTimestamp = parseInt(cachedResponse.headers.get('cache-timestamp') || '0');
    
    if (Date.now() - cacheTimestamp < CACHE_DURATION_MS) {
      return data;
    }
  }

  // Pass the signal to fetch
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);

  const data = await response.json();
  const newResponse = new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json',
      'cache-timestamp': Date.now().toString()
    }
  });  
  await cache.put(url, newResponse.clone());
  return data;
} 