import type { Category } from "@/lib/types";

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "hamburgueres", label: "Hambúrgueres", icon: "🍔" },
  { id: "porcoes", label: "Porções", icon: "🍟" },
  { id: "bebidas", label: "Bebidas", icon: "🥤" },
];

export function CategoryBar({ value, onChange }: { value: Category; onChange: (c: Category) => void }) {
  return (
    <nav className="sticky top-[68px] z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {CATEGORIES.map((c) => {
          const active = c.id === value;
          return (
            <button
              key={c.id}
              onClick={() => onChange(c.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.62_0.22_22/0.4)]"
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
