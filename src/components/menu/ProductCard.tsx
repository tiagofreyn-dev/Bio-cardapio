import type { Product } from "@/lib/types";
import { brl } from "@/lib/format";
import { Plus } from "lucide-react";

export function ProductCard({ product, onAdd, disabled }: { product: Product; onAdd: () => void; disabled?: boolean }) {
  const out = !product.available;
  return (
    <article className={`flex gap-3 p-3 rounded-2xl bg-surface ring-1 ring-border ${out ? "opacity-60" : ""}`}>
      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-surface-elevated flex items-center justify-center overflow-hidden text-4xl shrink-0">
        {product.image && (product.image.startsWith('http') || product.image.startsWith('/')) ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          product.image
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm leading-tight">{product.name}</h4>
        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-extrabold" style={{ color: "var(--price-color, var(--primary))" }}>{brl(product.price)}</span>
          <button
            disabled={out || disabled}
            onClick={onAdd}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground shadow-[0_4px_14px_oklch(0.62_0.22_22/0.4)] active:scale-95 transition"
            aria-label="Adicionar"
          >
            {out ? "✕" : <Plus className="w-5 h-5" />}
          </button>
        </div>
        {out && <p className="text-[10px] text-destructive font-semibold mt-1">Esgotado</p>}
      </div>
    </article>
  );
}
