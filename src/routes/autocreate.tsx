import { createFileRoute } from "@tanstack/react-router";

// ROTA DESATIVADA — ULTRA-LEVE / SEGURANÇA.
// Antes: GET público criava loja + usuário + 2 writes em store_data
// sem auth. Qualquer bot podia spammar e encher o banco/Auth (MAU)
// até estourar o limite do Supabase. Mantida como 410 Gone para
// não quebrar links antigos, sem tocar no banco.
export const Route = createFileRoute("/autocreate")({
  loader: async () => "GONE",
  component: () => (
    <div style={{ padding: 40, color: "white", fontSize: 16 }}>
      Rota desativada (410 Gone). Use /cadastro para criar lojas.
    </div>
  ),
});
