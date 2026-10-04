/* Teman Kopi offline service worker — cache-first for app shell, model, and assets */
const CACHE = 'teman-kopi-v2'

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache
        .addAll([
          '/',
          '/index.html',
          '/manifest.webmanifest',
          '/favicon.svg',
          '/models/teman-kopi/model.json',
          '/models/teman-kopi/weights.bin',
          '/models/teman-kopi/labels.json',
        ])
        .catch(() => undefined),
    ),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request)
      if (cached) return cached
      try {
        const fresh = await fetch(request)
        if (fresh && fresh.ok) {
          cache.put(request, fresh.clone())
        }
        return fresh
      } catch {
        if (request.mode === 'navigate') {
          const fallback = await cache.match('/index.html')
          if (fallback) return fallback
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' })
      }
    }),
  )
})
