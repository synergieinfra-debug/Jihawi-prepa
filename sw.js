/* Service worker Jihawi Prépa.
   Pages HTML : réseau d'abord (toujours la dernière version), cache seulement hors ligne.
   Autres fichiers (icônes, manifeste) : cache d'abord. VERSION est remplacée à chaque build. */
const VERSION = 'jihawi-886c5a9a';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // API et externes : jamais interceptés
  const isPage = e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  if (isPage) {
    e.respondWith(fetch(e.request).then(r => { if (r && r.ok) caches.open(VERSION).then(c => c.put(e.request, r.clone())); return r; })
      .catch(() => caches.match(e.request).then(c => c || caches.match('./index.html'))));
  } else {
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => { if (r && r.ok) caches.open(VERSION).then(x => x.put(e.request, r.clone())); return r; })));
  }
});
