import { createFileRoute } from "@tanstack/react-router";

// Keep-alive do Supabase (plano grátis).
// O Supabase pausa o projeto depois de ~7 dias SEM atividade no banco.
// Uma leitura mínima por dia conta como atividade e evita a pausa.
// Quem chama: cron da Vercel (ver vercel.json) ou um monitor externo
// (UptimeRobot / cron-job.org) apontando para GET /api/keepalive.

function envVar(name: string): string {
  const fromProcess = typeof process !== "undefined" ? process.env?.[name] : undefined;
  if (fromProcess) return fromProcess;
  const meta = import.meta as unknown as { env?: Record<string, string | undefined> };
  return meta.env?.[name] || "";
}

export const Route = createFileRoute("/api/keepalive")({
  server: {
    handlers: {
      GET: async () => {
        const url = envVar("VITE_SUPABASE_URL").replace(/\/$/, "");
        const key = envVar("VITE_SUPABASE_ANON_KEY");
        if (!url || !key) {
          return new Response(
            JSON.stringify({ ok: false, error: "Supabase não configurado no servidor." }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const startedAt = Date.now();
        try {
          // Leitura minúscula: 1 linha de 1 coluna. Conta como atividade no banco.
          const res = await fetch(`${url}/rest/v1/lojas?select=id&limit=1`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            signal: AbortSignal.timeout(15000),
          });
          const ok = res.ok;
          return new Response(
            JSON.stringify({
              ok,
              supabaseStatus: res.status,
              ms: Date.now() - startedAt,
              at: new Date().toISOString(),
              // 521/522 = projeto pausado ou fora do ar: precisa restaurar no painel.
              hint: ok
                ? "Projeto ativo."
                : res.status >= 520
                  ? "Projeto pausado/fora do ar — restaurar no painel do Supabase."
                  : undefined,
            }),
            {
              status: ok ? 200 : 502,
              headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
            },
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: err?.message || String(err),
              ms: Date.now() - startedAt,
              at: new Date().toISOString(),
              hint: "Projeto pausado/fora do ar — restaurar no painel do Supabase.",
            }),
            {
              status: 502,
              headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
            },
          );
        }
      },
    },
  },
});
