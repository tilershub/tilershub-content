const moved = new Set(['/providers', '/tilers', '/categories', '/services', '/jobs', '/job', '/post-project', '/join-tilershub', '/join-wedahub', '/account', '/dashboard', '/provider', '/login', '/notifications', '/brands', '/bathrooms', '/tile', '/tools', '/sponsor', '/explore', '/verify-claim', '/admin'])
export function migrationRedirect(url) {
  const root = '/' + url.pathname.split('/')[1]
  if (!moved.has(root)) return null
  const path = url.pathname.replace(/^\/join-tilershub(?=\/|$)/, '/join-wedahub')
  return 'https://wedahub.lk' + path + url.search
}
