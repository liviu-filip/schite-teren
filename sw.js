// Lucrul offline: fișierele aplicației stau în memoria tabletei; la fiecare pornire cu internet se aduc versiunile noi.
const V = 'schite-v8';
const F = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(F))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => {
    const net = fetch(e.request).then(resp => {
      if (resp.ok) { const cp = resp.clone(); caches.open(V).then(c => c.put(e.request, cp)); }
      return resp;
    }).catch(() => r);
    return r || net;
  }));
});
