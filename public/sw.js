// Minimal service worker for installability + basic offline shell.
// Phase 0: network-first for navigations, cache fallback. Kept intentionally simple.
const CACHE = "b2-trainer-v3";
const APP_SHELL = [
  "/",
  "/quick",
  "/grammar",
  "/reading",
  "/listening",
  "/vocab",
  "/gapfill",
  "/writing",
  "/receipt",
  "/progress",
  "/account",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/")),
      ),
  );
});
