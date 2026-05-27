import type { Category } from "@/lib/types";

export function CategoryBar({
  value,
  onChange,
  categories,
}: {
  value: Category;
  onChange: (c: Category) => void;
  categories: string[];
}) {
  return (
    <nav className="sticky top-[68px] z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {/* Adicionar a categoria "Todos" no início */}
        <button
          onClick={() => onChange("todos")}
          className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            value === "todos"
              ? "bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.62_0.22_22/0.4)]"
              : "bg-surface text-muted-foreground ring-1 ring-border"
          }`}
        >
          <span>🍽️</span>
          Todos
        </button>

        {categories.map((c) => {
          const active = c === value;
          // Expressão regular para verificar se o texto começa com emoji
          const hasEmoji = /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(c) || /^\p{Emoji}/u.test(c);
          
          return (
            <button
              key={c}
              onClick={() => onChange(c)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.62_0.22_22/0.4)]"
                  : "bg-surface text-muted-foreground ring-1 ring-border"
              }`}
            >
              {!hasEmoji && <span>😋</span>}
              {c}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
