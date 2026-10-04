// Altere a versão quando publicar mudanças no app ou no banco de questões.
const CACHE_PREFIX = 'quiz-incendio-offline-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const FILES = [
  './', './index.html', './style.css', './app.js',
  './questoes_incendio_urbano_cbmes_100.json', './questoes.json'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)));
  // Uma atualização será ativada depois que as abas da versão anterior fecharem.
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Mantém HTML, código e questões na mesma versão, inclusive sem rede.
    const cached = await cache.match(event.request, {ignoreSearch: true});
    if (cached) return cached;
    try { return await fetch(event.request); }
    catch (error) {
      if (event.request.mode === 'navigate') return await cache.match('./index.html');
      throw error;
    }
  })());
});
