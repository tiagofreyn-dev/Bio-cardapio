import type { Category } from "@/lib/types";
import { useTenant } from "@/lib/tenant";

const DEFAULT_CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "hamburgueres", label: "Hambúrgueres", icon: "🍔" },
  { id: "porcoes", label: "Porções", icon: "🍟" },
  { id: "bebidas", label: "Bebidas", icon: "🥤" },
];

const ACAI_CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "acai", label: "Açaí (Copos)", icon: "🟣" },
  { id: "milkshake", label: "Milk-Shake", icon: "🥤" },
  { id: "sorvetes", label: "Sorvetes", icon: "🍨" },
  { id: "gelinho", label: "Gelinho & Picolé", icon: "🧊" },
  { id: "salgados", label: "Salgados", icon: "🥟" },
  { id: "doces", label: "Doces & Sobremesas", icon: "🍰" },
  { id: "bebidas", label: "Bebidas", icon: "🥤" },
];

export function CategoryBar({ value, onChange }: { value: Category; onChange: (c: Category) => void }) {
  const { tenant } = useTenant();
  const isAcai = tenant?.slug.includes("acai") ?? false;
  const categoriesList = isAcai ? ACAI_CATEGORIES : DEFAULT_CATEGORIES;

  return (
    <nav className="sticky top-[68px] z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {categoriesList.map((c) => {
          const active = c.id === value;
          return (
            <button
              key={c.id}
              onClick={() => onChange(c.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_var(--primary)]"
                  : "bg-surface text-muted-foreground ring-1 ring-border"
              }`}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
