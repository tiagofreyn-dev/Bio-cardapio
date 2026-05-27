import { useState } from "react";
import type { Product } from "@/lib/types";
import { brl } from "@/lib/format";
import { X, Check } from "lucide-react";

export function CustomizeModal({
  product,
  onClose,
  onConfirm,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: (selected: { nome: string; preco: number }[]) => void;
}) {
  const additions = product.adicionais || [];
  const [selected, setSelected] = useState<{ nome: string; preco: number }[]>([]);

  const totalPrice = product.price + selected.reduce((sum, item) => sum + item.preco, 0);

  function toggleAddition(addon: { nome: string; preco: number }) {
    setSelected((prev) => {
      const exists = prev.some((item) => item.nome === addon.nome);
      if (exists) {
        return prev.filter((item) => item.nome !== addon.nome);
      } else {
        return [...prev, addon];
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-border max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface flex items-center justify-between p-4 border-b border-border z-10">
          <div>
            <p className="text-[11px] uppercase text-primary font-bold tracking-wider">Adicionar Opcionais</p>
            <h3 className="font-extrabold">{product.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-4">
          <section className="space-y-2">
            <h4 className="text-xs uppercase font-extrabold text-muted-foreground tracking-wider mb-3">Escolha os adicionais que deseja:</h4>
            
            <div className="space-y-2">
              {additions.map((addon) => {
                const isChecked = selected.some((item) => item.nome === addon.nome);
                return (
                  <button
                    key={addon.nome}
                    type="button"
                    onClick={() => toggleAddition(addon)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition text-left active:scale-[0.99] ${
                      isChecked 
                        ? "border-primary bg-primary/10 ring-1 ring-primary" 
                        : "border-border bg-surface-elevated hover:bg-zinc-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        isChecked ? "bg-primary border-primary text-primary-foreground" : "border-border bg-zinc-950"
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                      </div>
                      <span className="text-sm font-bold text-white">{addon.nome}</span>
                    </div>
                    <span className="text-xs font-black text-primary">
                      {addon.preco > 0 ? `+ ${brl(addon.preco)}` : "Grátis"}
                    </span>
                  </button>
                );
              })}
              {additions.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-4">Nenhum adicional disponível para este produto.</p>
              )}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 p-4 bg-surface border-t border-border z-10">
          <button
            onClick={() => onConfirm(selected)}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black shadow-[0_6px_20px_oklch(0.62_0.22_22/0.5)] active:scale-[0.99] transition text-sm"
          >
            Confirmar e Adicionar — {brl(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}
