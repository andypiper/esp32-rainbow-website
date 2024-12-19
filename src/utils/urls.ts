export const SPECTRUM_COMPUTING_BASE_URL = 'https://spectrumcomputing.co.uk';
// Development settings
const isDevelopment = import.meta.env.DEV;
const DEV_PROXY_URL = 'http://localhost:8787/proxy';

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