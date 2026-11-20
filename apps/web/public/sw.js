// No fetch handler: every request goes straight to the network, without a
// detour through this worker. Chrome no longer needs one to offer install
// (the manifest is enough); the worker stays registered so browsers that
// installed Ciclo with it keep a controller, and so a later version can add
// offline support. Never cache diary, vault, or recovery responses here.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
