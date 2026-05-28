import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const stripe = new Stripe(stripeKey, {
  apiVersion: "2023-10-16" as any,
});

// Inicializar cliente do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (!stripeKey) {
            return new Response("Server misconfigured: missing Stripe secret key.", { status: 500 });
          }

          const signature = request.headers.get("stripe-signature") || "";
          if (!signature) {
            return new Response("Missing signature header.", { status: 400 });
          }

          const rawBody = await request.text();
          let event: Stripe.Event;

          try {
            event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
          } catch (err: any) {
            console.error("Assinatura do Webhook falhou:", err.message);
            // Fallback para ambiente de teste local se o secret do webhook estiver ausente ou for padrão
            if (webhookSecret === "whsec_test" || !webhookSecret) {
              console.warn("Ambiente de teste: ignorando assinatura do webhook");
              event = JSON.parse(rawBody);
            } else {
              return new Response(`Webhook Error: ${err.message}`, { status: 400 });
            }
          }

          console.log(`Evento Stripe recebido: ${event.type}`);

          // Tratar eventos de sucesso de pagamento
          if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const lojaId = session.metadata?.loja_id;

            if (lojaId) {
              console.log(`Assinatura ativada para a loja: ${lojaId}`);
              const { error } = await supabase
                .from("lojas")
                .update({ status_assinatura: "ativo" })
                .eq("id", lojaId);

              if (error) throw error;
            }
          }

          if (event.type === "invoice.payment_succeeded") {
            const invoice = event.data.object as Stripe.Invoice;
            // Buscar metadata a partir da assinatura se disponível
            let lojaId = invoice.metadata?.loja_id;

            if (!lojaId && invoice.subscription) {
              const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
              lojaId = subscription.metadata?.loja_id;
            }

            if (lojaId) {
              console.log(`Pagamento de fatura bem-sucedido para a loja: ${lojaId}`);
              const { error } = await supabase
                .from("lojas")
                .update({ status_assinatura: "ativo" })
                .eq("id", lojaId);

              if (error) throw error;
            }
          }

          // Tratar eventos de falha ou cancelamento
          if (
            event.type === "customer.subscription.deleted" ||
            event.type === "invoice.payment_failed"
          ) {
            const object = event.data.object as any;
            let lojaId = object.metadata?.loja_id;

            if (!lojaId && object.subscription) {
              const subscription = await stripe.subscriptions.retrieve(object.subscription as string);
              lojaId = subscription.metadata?.loja_id;
            }

            if (lojaId) {
              console.log(`Assinatura inadimplente/cancelada para a loja: ${lojaId}`);
              const { error } = await supabase
                .from("lojas")
                .update({ status_assinatura: "pendente" })
                .eq("id", lojaId);

              if (error) throw error;
            }
          }

          return new Response(JSON.stringify({ received: true }), {
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
