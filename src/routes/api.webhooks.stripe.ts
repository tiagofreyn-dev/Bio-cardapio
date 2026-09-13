import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Inicializar cliente do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Idempotência em memória: retries do provedor dentro de 10min não
// geram novo UPDATE (economiza writes e evita flip-flop de status).
const _seenEvents = new Map<string, number>();
function isDuplicate(eventId: string): boolean {
  const now = Date.now();
  for (const [k, t] of _seenEvents) if (now - t > 10 * 60 * 1000) _seenEvents.delete(k);
  if (_seenEvents.has(eventId)) return true;
  _seenEvents.set(eventId, now);
  return false;
}

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // ULTRA-LEVE + SEGURANÇA: exige segredo do webhook.
          // Antes: qualquer POST com {reference} flipava status da loja
          // e cada retry gerava 1 write. Agora sem segredo = 401 sem DB.
          const webhookSecret = process.env.CAKTO_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "";
          const provided =
            request.headers.get("x-webhook-secret") ||
            request.headers.get("x-cakto-secret") ||
            new URL(request.url).searchParams.get("secret") ||
            "";
          if (webhookSecret && provided !== webhookSecret) {
            return new Response("Unauthorized", { status: 401 });
          }
          const rawBody = await request.text();
          if (rawBody.length > 20000) {
            return new Response("Payload too large", { status: 413 });
          }
          let payload: any;
          try {
            payload = JSON.parse(rawBody);
          } catch (e) {
            return new Response("Invalid JSON body", { status: 400 });
          }

          console.log("Evento Recebido do Webhook:", payload);

          // 1. Webhook da plataforma CAKTO (Cactus)
          // A Cakto envia o evento 'subscription.status.changed' ou 'sale.approved'
          const eventType = payload.event || payload.status;
          
          // O identificador da loja (lojaId) passamos via checkout param 'ext' ou 'ref',
          // que a Cakto retorna em payload.reference ou metadata
          const ref = payload.reference || payload.metadata?.ref || payload.ref;
          // Dedup por event-id (Cakto/Stripe reenviam em retry).
          const eventId = String(
            payload.id || payload.event_id || payload.eventId || `${eventType}:${ref}`,
          );
          if (isDuplicate(eventId)) {
            return new Response(JSON.stringify({ received: true, deduplicated: true }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
          
          if (ref) {
            // A Cakto envia status como 'active', 'approved', 'paid', 'completed' para pago
            // ou 'canceled', 'refunded', 'expired' para cancelamento/falha
            const isApproved = 
              eventType === "subscription.active" || 
              eventType === "subscription.renewed" ||
              payload.status === "paid" || 
              payload.status === "approved" ||
              payload.status === "active" ||
              String(payload.event).includes("approved") ||
              String(payload.event).includes("active") ||
              String(payload.status).includes("active");

            const isCanceledOrFailed = 
              eventType === "subscription.canceled" || 
              eventType === "subscription.expired" ||
              payload.status === "canceled" || 
              payload.status === "expired" ||
              payload.status === "failed";

            if (isApproved) {
              console.log(`[CAKTO Webhook] Assinatura ativa para a loja: ${ref}`);
              const { error } = await supabase
                .from("lojas")
                .update({ status_assinatura: "ativo" })
                .eq("id", ref);
              if (error) throw error;
            } else if (isCanceledOrFailed) {
              console.log(`[CAKTO Webhook] Assinatura inativa para a loja: ${ref}`);
              const { error } = await supabase
                .from("lojas")
                .update({ status_assinatura: "pendente" })
                .eq("id", ref);
              if (error) throw error;
            }
          }

          // 2. Webhook clássico da Stripe (Mantido por compatibilidade interna)
          const stripeSignature = request.headers.get("stripe-signature");
          if (stripeSignature && process.env.STRIPE_SECRET_KEY) {
            // Lógica antiga do Stripe que já existia no arquivo anterior...
            const lojaId = payload.metadata?.loja_id || payload.data?.object?.metadata?.loja_id;
            if (lojaId) {
              const isStripeApproved = 
                payload.type === "checkout.session.completed" || 
                payload.type === "invoice.payment_succeeded";
              const isStripeFailed = 
                payload.type === "customer.subscription.deleted" || 
                payload.type === "invoice.payment_failed";

              if (isStripeApproved) {
                await supabase.from("lojas").update({ status_assinatura: "ativo" }).eq("id", lojaId);
              } else if (isStripeFailed) {
                await supabase.from("lojas").update({ status_assinatura: "pendente" }).eq("id", lojaId);
              }
            }
          }

          return new Response(JSON.stringify({ received: true, platform: ref ? "Cakto" : "Stripe" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          console.error("Erro no processamento do Webhook:", err);
          return new Response(`Webhook Error: ${err.message}`, { status: 500 });
        }
      },
    },
  },
});
