import type { Category } from "@/lib/types";

/** Remove emoji inicial do nome (ex: "🔥 Promoções" -> "Promoções"). */
export function stripLeadingEmoji(name: string): string {
  return name.replace(/^[^\p{L}\p{N}#*]+/u, "").trim();
}

/** Detecta se o texto já começa com emoji. */
export function startsWithEmoji(text: string): boolean {
  return /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(text.slice(0, 2)) || /^\p{Emoji}/u.test(text);
}

export function CategoryBar({
  value,
  onChange,
  categories,
  emojis,
}: {
  value: Category;
  onChange: (c: Category) => void;
  categories: string[];
  emojis?: Record<string, string>;
}) {
  return (
    <nav className="sticky top-[68px] z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {categories.map((c) => {
          const active = c === value;
          const hasMapping = !!emojis && Object.prototype.hasOwnProperty.call(emojis, c);
          const mapped = hasMapping ? (emojis as Record<string, string>)[c] : undefined;
          // Com mapeamento: usa o emoji escolhido ("" = sem emoji) e evita duplicar
          // caso o nome da categoria já contenha um emoji embutido.
          // Sem mapeamento: comportamento atual (emoji embutido ou 😋 padrão).
          const emoji = hasMapping ? mapped || "" : startsWithEmoji(c) ? "" : "😋";
          const label = hasMapping ? stripLeadingEmoji(c) || c : c;

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
              {!!emoji && <span>{emoji}</span>}
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
