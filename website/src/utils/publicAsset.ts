const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;

export function resolvePublicAssetUrl(url?: string | null) {
  if (!url) return '';

  if (
    ABSOLUTE_URL_PATTERN.test(url) ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  if (normalizedBaseUrl !== '/' && url.startsWith(normalizedBaseUrl)) {
    return url;
  }

  const normalizedUrl = url.startsWith('/') ? url.slice(1) : url;
  return `${normalizedBaseUrl}${normalizedUrl}`;
}
