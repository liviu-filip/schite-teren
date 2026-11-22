// Lucrul offline: fișierele aplicației stau în memoria tabletei.
// Cu internet se ia întâi versiunea nouă de pe server (fără cache-ul browserului); fără internet, copia salvată.
const V = 'schite-v32';
const F = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(F))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const dinCache = () => caches.match(e.request, { ignoreSearch: true });
  const net = fetch(e.request, { cache: 'no-cache' }).then(resp => {
    if (resp.ok) { const cp = resp.clone(); caches.open(V).then(c => c.put(e.request, cp)); }
    return resp;
  });
  /* semnal slab: după 4 secunde se folosește copia salvată, ca aplicația să pornească oricum */
  const limita = new Promise(rez => setTimeout(rez, 4000)).then(dinCache);
  e.respondWith(Promise.race([net.catch(dinCache), limita.then(r => r || net)]).then(r => r || net));
});
