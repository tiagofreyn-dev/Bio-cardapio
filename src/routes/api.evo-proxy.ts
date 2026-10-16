import { createFileRoute } from "@tanstack/react-router";

// Proxy seguro Evolution API (v2): o navegador chama /api/evo-proxy (mesma
// origem, sem CORS) e SÓ o servidor encosta na EVO_API_KEY.
// Env vars (sem VITE_): EVO_BASE_URL, EVO_API_KEY — .env.local + Vercel.
// 1 instância = 1 WhatsApp por loja (instance_name = slug da loja).

const ALLOW = new Set([
  "status", // GET /instance/connectionState/:instance
  "qrcode", // GET /instance/connect/:instance (retorna QR/base64)
  "create", // POST /instance/create {instanceName}
  "sendText", // POST /message/sendText/:instance {number,text}
  "sendMedia", // POST /message/sendMedia/:instance {number,mediatype,media,caption}
]);

export const Route = createFileRoute("/api/evo-proxy")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const base = (process.env.EVO_BASE_URL || "").replace(/\/$/, "");
        const key = process.env.EVO_API_KEY || "";
        if (!base || !key) {
          return new Response(
            JSON.stringify({ error: "Evolution não configurada no servidor (EVO_BASE_URL/EVO_API_KEY)." }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "JSON inválido." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        const { action, instance, payload } = body || {};
        if (!ALLOW.has(String(action))) {
          return new Response(JSON.stringify({ error: "Ação não permitida." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        const inst = String(instance || "").trim();
        if (!inst || !/^[a-z0-9-]{3,64}$/i.test(inst)) {
          return new Response(JSON.stringify({ error: "instance inválida (use slug da loja)." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        try {
          let url = "";
          let method = "GET";
          let data: any = undefined;
          if (action === "status") {
            url = `${base}/instance/connectionState/${encodeURIComponent(inst)}`;
          } else if (action === "qrcode") {
            url = `${base}/instance/connect/${encodeURIComponent(inst)}`;
          } else if (action === "create") {
            method = "POST";
            url = `${base}/instance/create`;
            data = { integration: "WHATSAPP-BAILEYS", qrcode: true, ...(payload || {}), instanceName: inst };
          } else if (action === "sendText") {
            method = "POST";
            url = `${base}/message/sendText/${encodeURIComponent(inst)}`;
            data = payload;
          } else {
            method = "POST";
            url = `${base}/message/sendMedia/${encodeURIComponent(inst)}`;
            data = payload;
          }
          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", apikey: key },
            body: data ? JSON.stringify(data) : undefined,
            // Nunca pendura o navegador: 30s por chamada (1º envio abre sessão e demora).
            signal: AbortSignal.timeout(30000),
          });
          const text = await res.text();
          return new Response(text, {
            status: res.status,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: "Falha ao falar com Evolution: " + (err?.message || err) }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
