import type { Product } from "@/lib/types";
import { brl } from "@/lib/format";
import { Plus } from "lucide-react";

export function ProductCard({ product, onAdd, disabled }: { product: Product; onAdd: () => void; disabled?: boolean }) {
  // Estoque: null/undefined = ilimitado. Controlado só quando stock é número.
  const tracked = typeof product.stock === "number";
  const out = !product.available || (tracked && (product.stock as number) <= 0);
  const lowThreshold = product.lowStockThreshold ?? 5;
  const low = tracked && !out && (product.stock as number) <= lowThreshold;
  return (
    <button 
      onClick={onAdd}
      disabled={out || disabled}
      className={`flex text-left w-full gap-3 p-3 rounded-2xl bg-surface ring-1 ring-border active:scale-[0.98] transition-all focus:outline-none focus:ring-primary ${out ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"}`}
    >
      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-surface-elevated flex items-center justify-center overflow-hidden text-4xl shrink-0">
        {product.image && (product.image.startsWith('http') || product.image.startsWith('/')) ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          product.image
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="font-bold text-sm leading-tight text-white">{product.name}</h4>
        <p className="text-[11px] text-muted-foreground mt-1 whitespace-pre-wrap break-words">{product.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-extrabold">{brl(product.price)}</span>
          <div
            className={`inline-flex items-center justify-center w-9 h-9 rounded-full shadow-[0_4px_14px_oklch(0.62_0.22_22/0.4)] transition-colors ${out || disabled ? "bg-muted text-muted-foreground shadow-none" : "bg-primary text-primary-foreground"}`}
          >
            {out ? "✕" : <Plus className="w-5 h-5" />}
          </div>
        </div>
        {out && <p className="text-[10px] text-destructive font-semibold mt-1">Esgotado</p>}
        {!out && low && (
          <p className="text-[10px] font-bold mt-1 text-amber-500 animate-pulse">
            Só {product.stock} un!
          </p>
        )}
      </div>
    </button>
  );
}
