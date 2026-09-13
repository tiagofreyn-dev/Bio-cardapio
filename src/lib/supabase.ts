import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// MODO ULTRA-LEVE: realtime desligado (não usamos em nenhum lugar),
// sessão persistida, sem sockets extras. Economiza conexões e egress.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
        realtime: { params: { eventsPerSecond: 1 } },
        global: { headers: { "x-client": "cardapio-ultra-light" } },
      })
    : null;

// Desliga realtime explicitamente quando o client existir (nenhuma
// tabela usa .channel() — manter desligado evita cobrança de mensagens).
if (supabase && typeof (supabase as any).realtime?.setAuth === "function") {
  try {
    (supabase as any).realtime.enabled = false;
  } catch {}
}
