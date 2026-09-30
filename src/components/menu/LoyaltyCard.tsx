import { useState } from "react";
import { storage } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "").slice(0, 15);
}

export function LoyaltyCard() {
  const settings = useStorageSync(() => storage.getSettings());
  const products = useStorageSync(() => storage.getProducts());
  const activePhone = useStorageSync(() => storage.getLoyaltyPhone());
  // Reage à troca do telefone ativo (o getter abaixo lê o ativo atual).
  const points = useStorageSync(() => {
    const ph = storage.getLoyaltyPhone();
    return storage.getLoyaltyPoints(ph || undefined);
  });
  const legacyPoints = useStorageSync(() => storage.getLoyaltyPoints());
  const [draft, setDraft] = useState("");
  const [msg, setMsg] = useState("");

  const goal = settings.loyaltyGoal;
  const completed = points >= goal;

  const rewardProd = settings.loyaltyRewardId ? products.find((p) => p.id === settings.loyaltyRewardId) : null;
  const rewardName = rewardProd ? rewardProd.name : "lanche";

  function linkPhone() {
    const digits = onlyDigits(draft);
    if (digits.length < 10) {
      setMsg("Digite seu celular com DDD (ex: 44999998888).");
      return;
    }
    const migrated = storage.migrateLegacyLoyalty(digits);
    storage.setLoyaltyPhone(digits);
    setDraft("");
    setMsg(
      migrated
        ? `Celular vinculado! Seus ${legacyPoints} ponto(s) antigos vieram junto. 🎉`
        : "Celular vinculado! Seus pontos agora seguem seu número. 📱",
    );
  }

  return (
    <section className="mx-4 mt-4 rounded-2xl p-4 bg-gradient-to-br from-surface-elevated to-surface ring-1 ring-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-extrabold tracking-tight">🔥 Cartão Fidelidade</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            A cada {goal} pedidos acima de R$ {settings.loyaltyMinOrder.toFixed(2).replace(".", ",")}, ganhe 1 {rewardName} grátis!
          </p>
        </div>
        <span className="text-xs font-bold text-primary whitespace-nowrap">{Math.min(points, goal)}/{goal}</span>
      </div>

      {/* Vinculação por celular: o cartão segue o número, não o aparelho */}
      {!activePhone ? (
        <div className="mb-3 rounded-xl bg-black/20 ring-1 ring-border p-3">
          <p className="text-[11px] font-bold text-zinc-300">
            📱 Informe seu celular para juntar pontos no seu número
            {legacyPoints > 0 ? ` (você tem ${legacyPoints} ponto(s) neste aparelho para migrar)` : ""}:
          </p>
          <div className="flex gap-2 mt-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              inputMode="tel"
              placeholder="DDD + número"
              className="flex-1 h-10 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm font-bold"
            />
            <button
              type="button"
              onClick={linkPhone}
              className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold active:scale-95 transition"
            >
              Vincular
            </button>
          </div>
          {msg && <p className="text-[11px] text-emerald-400 font-bold mt-1.5">{msg}</p>}
        </div>
      ) : (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-black/20 ring-1 ring-border px-3 py-2">
          <p className="text-[11px] text-zinc-300">
            📱 Cartão de <span className="font-black text-white">{activePhone}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              storage.setLoyaltyPhone("");
              setMsg("");
            }}
            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300"
          >
            trocar
          </button>
        </div>
      )}

      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: goal }).map((_, i) => {
          const filled = i < points;
          return (
            <div
              key={i}
              className={`aspect-square rounded-full flex items-center justify-center text-[11px] transition-all ${
                filled
                  ? "bg-primary text-primary-foreground shadow-[0_0_10px_oklch(0.62_0.22_22/0.5)]"
                  : "bg-muted text-muted-foreground/40 border border-dashed border-border"
              }`}
            >
              {filled ? "🍔" : ""}
            </div>
          );
        })}
      </div>

      {completed && (
        <div className="mt-3 rounded-xl px-3 py-2 bg-primary text-primary-foreground text-center font-bold text-sm animate-pulse-glow">
          🎉 PARABÉNS! Seu próximo lanche é grátis!
        </div>
      )}
    </section>
  );
}
