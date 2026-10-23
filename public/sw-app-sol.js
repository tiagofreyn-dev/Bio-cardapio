// Service worker mínimo do app da Sol.
// Existe só para o celular deixar "Adicionar à tela inicial" como app de
// verdade (tela cheia). Não guarda cache: o app sempre busca os pedidos novos.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // sem respondWith: o navegador busca na rede normalmente
});
