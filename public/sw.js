/* Minimal service worker — makes the CRM installable as a PWA (home-screen icon
   on iOS/Android). The inbox needs live data, so we intentionally do NOT cache
   dynamic responses; this SW just satisfies installability and can host push
   notifications in a later phase. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  /* pass-through: let the network handle every request */
});
