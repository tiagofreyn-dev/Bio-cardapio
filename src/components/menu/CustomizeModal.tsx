import { useState } from "react";
import type { Product } from "@/lib/types";
import { brl } from "@/lib/format";
import { X, Minus, Plus, Pizza } from "lucide-react";

export function CustomizeModal({
  product,
  onClose,
  onConfirm,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: (selected: { nome: string; preco: number }[]) => void;
}) {
  const additions = (product.adicionais || []).map((addon) => ({
    nome: String(addon.nome || ""),
    preco: Number(addon.preco || 0),
    descricao: String(addon.descricao || ""),
  }));
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const isPizza = product.category?.toLowerCase().includes("pizza") || product.name?.toLowerCase().includes("pizza");
  
  const maxFlavors = (() => {
    if (!isPizza) return 1;
    if (product.max_sabores && product.max_sabores > 1) return product.max_sabores;
    const match = product.name.match(/(\d+)\s*sabores/i);
    return match ? parseInt(match[1]) : 3; // Default to 3 flavors if not specified
  })();

  const currentSelectedCount = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  const totalPrice = Number(product.price || 0) + additions.reduce((sum, item) => {
    const qty = quantities[item.nome] || 0;
    return sum + (item.preco * qty);
  }, 0);

  function adjustQuantity(name: string, delta: number) {
    setQuantities((prev) => {
      const current = prev[name] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [name]: next };
    });
  }

  function handleConfirm() {
    const selectedList = additions
      .filter((item) => (quantities[item.nome] || 0) > 0)
      .map((item) => {
        const qty = quantities[item.nome];
        if (qty === 1) {
          return { nome: item.nome, preco: item.preco, descricao: item.descricao };
        }
        return { nome: `${item.nome} (x${qty})`, preco: item.preco * qty, descricao: item.descricao };
      });
    onConfirm(selectedList);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center font-sans" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-border max-h-[90vh] overflow-y-auto text-left">
        <div className="sticky top-0 bg-surface flex items-center justify-between p-4 border-b border-border z-10">
          <div>
            <p className="text-[11px] uppercase text-primary font-bold tracking-wider flex items-center gap-1">
              {isPizza && <Pizza className="w-3.5 h-3.5 text-primary animate-pulse" />}
              {isPizza ? `Monte sua Pizza (Até ${maxFlavors} Sabores)` : "Adicionar Opcionais"}
            </p>
            <h3 className="font-extrabold text-white text-base mt-0.5">{product.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-4">
          {isPizza && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3.5 flex justify-between items-center text-xs text-white">
              <div className="space-y-0.5">
                <span className="font-extrabold block">Escolha os Sabores</span>
                <span className="text-[10px] text-zinc-400 block">Selecione entre as opções listadas abaixo.</span>
              </div>
              <span className="font-black text-primary bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800 text-sm shrink-0">
                {currentSelectedCount} / {maxFlavors}
              </span>
            </div>
          )}

          <section className="space-y-2">
            <h4 className="text-xs uppercase font-extrabold text-muted-foreground tracking-wider mb-3">
              {isPizza ? "Sabores Disponíveis:" : "Opções de Adicionais:"}
            </h4>
            
            <div className="space-y-2">
              {additions.map((addon) => {
                const qty = quantities[addon.nome] || 0;
                const isSelected = qty > 0;
                return (
                  <div
                    key={addon.nome}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition ${
                      isSelected 
                        ? "border-primary bg-primary/10 ring-1 ring-primary" 
                        : "border-border bg-surface-elevated"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-sm font-bold text-white truncate">{addon.nome}</span>
                      {addon.descricao && (
                        <span className="text-[10px] text-zinc-400 mt-0.5 leading-snug break-words max-w-[240px]">
                          {addon.descricao}
                        </span>
                      )}
                      <span className="text-[11px] font-black text-primary mt-0.5">
                        {addon.preco > 0 ? `+ ${brl(addon.preco)}` : "Incluso"}
                      </span>
                    </div>

                    {isPizza ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            adjustQuantity(addon.nome, -1);
                          } else {
                            if (currentSelectedCount < maxFlavors) {
                              adjustQuantity(addon.nome, 1);
                            } else {
                              alert(`Limite de sabores atingido! Você pode escolher no máximo ${maxFlavors} sabores para esta pizza.`);
                            }
                          }
                        }}
                        className={`h-8 px-4 rounded-xl font-bold text-xs transition active:scale-95 shrink-0 ${
                          isSelected 
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {isSelected ? "Selecionado ✓" : "Selecionar"}
                      </button>
                    ) : (
                      /* Quantity Selector */
                      <div className="flex items-center gap-3 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-800/80 shrink-0">
                        <button
                          type="button"
                          onClick={() => adjustQuantity(addon.nome, -1)}
                          disabled={qty === 0}
                          className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-40 flex items-center justify-center transition active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black text-white w-4 text-center select-none">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustQuantity(addon.nome, 1)}
                          className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center transition active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {additions.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-4">Nenhum opcional disponível para este produto.</p>
              )}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 p-4 bg-surface border-t border-border z-10">
          <button
            onClick={handleConfirm}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black shadow-[0_6px_20px_oklch(0.62_0.22_22/0.5)] active:scale-[0.99] transition text-sm"
          >
            Confirmar e Adicionar — {brl(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}

