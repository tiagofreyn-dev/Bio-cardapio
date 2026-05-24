import { storage } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";

export function LoyaltyCard() {
  const points = useStorageSync(() => storage.getLoyaltyPoints());
  const settings = useStorageSync(() => storage.getSettings());
  const products = useStorageSync(() => storage.getProducts());
  const goal = settings.loyaltyGoal;
  const completed = points >= goal;

  const rewardProd = settings.loyaltyRewardId ? products.find((p) => p.id === settings.loyaltyRewardId) : null;
  const rewardName = rewardProd ? rewardProd.name : "lanche";

  return (
    <section className="mx-4 mt-4 rounded-2xl p-4 bg-gradient-to-br from-surface-elevated to-surface ring-1 ring-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-extrabold tracking-tight">🔥 Cartão Fidelidade Insano</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            A cada {goal} pedidos acima de R$ {settings.loyaltyMinOrder.toFixed(2).replace(".", ",")}, ganhe 1 {rewardName} grátis!
          </p>
        </div>
        <span className="text-xs font-bold text-primary whitespace-nowrap">{Math.min(points, goal)}/{goal}</span>
      </div>

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
