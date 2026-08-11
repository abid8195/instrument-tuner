/**
 * Service Worker for Instrument Tuner PWA
 * Enables offline-first functionality and caching
 */

const CACHE_NAME = 'instrument-tuner-v1'
// Relative to the service worker's own scope, so this works whether the app
// is served from the domain root or a subpath (e.g. GitHub Pages project
// sites at /<repo>/).
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => undefined)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
  self.clients.claim()
})

// Network first, fallback to cache — keeps the app fresh online, still
// works offline once the shell has been cached once.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
      .catch(() => caches.match(event.request))
  )
})
