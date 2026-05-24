import { useState } from "react";
import type { Product } from "@/lib/types";
import { brl } from "@/lib/format";
import { X, Minus, Plus } from "lucide-react";
import { storage } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";

export function CustomizeModal({
  product,
  onClose,
  onConfirm,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: (opts: { lettuce?: "Alface Tradicional" | "Alface Americana"; ketchup?: number; mayo?: number }) => void;
}) {
  const settings = useStorageSync(() => storage.getSettings());
  const mayoPrice = settings.mayoPrice ?? 2.00;

  const showLettuce = product.hasLettuceOption ?? product.customizable;
  const showKetchup = product.hasKetchupOption ?? product.customizable;
  const showMayo = product.hasMayoOption ?? product.customizable;

  const [lettuce, setLettuce] = useState<"Alface Tradicional" | "Alface Americana">("Alface Tradicional");
  const [ketchup, setKetchup] = useState(0);
  const [mayo, setMayo] = useState(0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-border max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface flex items-center justify-between p-4 border-b border-border">
          <div>
            <p className="text-[11px] uppercase text-primary font-bold tracking-wider">Customização</p>
            <h3 className="font-extrabold">{product.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-5">
          {showLettuce && (
            <section>
              <h4 className="text-sm font-bold mb-2">Escolha a alface <span className="text-destructive">*</span></h4>
              <div className="space-y-2">
                {(["Alface Tradicional", "Alface Americana"] as const).map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl ring-1 cursor-pointer ${lettuce === opt ? "ring-primary bg-primary/10" : "ring-border bg-surface-elevated"}`}>
                    <input
                      type="radio"
                      name="lettuce"
                      checked={lettuce === opt}
                      onChange={() => setLettuce(opt)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {showKetchup && (
            <section>
              <h4 className="text-sm font-bold mb-1">Sachês extras de Ketchup</h4>
              <p className="text-[11px] text-muted-foreground mb-2">De 0 a 5 unidades (Até 2 grátis, adicionais +R$ 0,50 cada)</p>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-elevated ring-1 ring-border w-fit">
                <button onClick={() => setKetchup((k) => Math.max(0, k - 1))} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                <span className="w-6 text-center font-bold">{ketchup}</span>
                <button onClick={() => setKetchup((k) => Math.min(5, k + 1))} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-4 h-4" /></button>
              </div>
            </section>
          )}

          {showMayo && (
            <section>
              <h4 className="text-sm font-bold mb-1">Potes extras de Maionese Verde</h4>
              <p className="text-[11px] text-muted-foreground mb-2">De 0 a 5 unidades (+{brl(mayoPrice)} cada)</p>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-elevated ring-1 ring-border w-fit">
                <button onClick={() => setMayo((m) => Math.max(0, m - 1))} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                <span className="w-6 text-center font-bold">{mayo}</span>
                <button onClick={() => setMayo((m) => Math.min(5, m + 1))} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-4 h-4" /></button>
              </div>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 p-4 bg-surface border-t border-border">
          <button
            onClick={() => onConfirm({ 
              lettuce: showLettuce ? lettuce : undefined, 
              ketchup: showKetchup ? ketchup : undefined, 
              mayo: showMayo ? mayo : undefined 
            })}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-[0_6px_20px_oklch(0.62_0.22_22/0.5)] active:scale-[0.99]"
          >
            Confirmar e Adicionar — {brl(
              product.price + 
              (showMayo ? mayo * mayoPrice : 0) + 
              (showKetchup && ketchup > 2 ? (ketchup - 2) * 0.50 : 0)
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
