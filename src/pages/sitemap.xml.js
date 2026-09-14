import { BLOG_POSTS } from '../lib/blog-posts.js'
import { GUIDES } from '../data/guides.js'
export const prerender = true
export function GET() {
  const paths = ['/', '/blog', '/guides', '/estimator', '/about', '/contact', '/privacy-policy', '/terms', ...BLOG_POSTS.map(p => '/blog/' + p.slug), ...GUIDES.map(g => '/guides/' + g.slug)]
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + paths.map(path => '<url><loc>' + escape('https://tilershub.lk' + path) + '</loc></url>').join('') + '</urlset>', { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
