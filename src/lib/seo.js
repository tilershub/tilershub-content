// Prerendered article directories are served with a trailing slash by Cloudflare.
// Keep server-rendered landing pages (especially /estimator) at their existing URLs.
export function canonicalPath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  return /^\/(blog|guides)\/[^/]+$/.test(path) ? path + '/' : path
}
export function canonicalUrl(pathname) {
  return new URL(canonicalPath(pathname), 'https://tilershub.lk').href
}
