// Retire the previous marketplace worker when TilersHub becomes a resource site.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(key => key.startsWith('tilershub-')).map(key => caches.delete(key)))
    await self.registration.unregister()
  })())
})
