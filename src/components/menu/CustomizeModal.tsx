import { useState } from "react";
import type { Product } from "@/lib/types";
import { brl } from "@/lib/format";
import { X, Minus, Plus } from "lucide-react";
import { storage } from "@/lib/storage";

export function CustomizeModal({
  product,
  onClose,
  onConfirm,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: (finalPrice: number, additionsText: string, selectedChoices: any[]) => void;
}) {
  const settings = storage.getSettings();
  const allTemplates = settings?.choiceGroupTemplates || [];
  
  // Normalize old strings if needed and map to a combined object
  const choiceGroups = (product.choice_groups || []).map(g => {
    const isString = typeof g === 'string';
    const templateId = isString ? g : (g as any).template_id;
    const template = allTemplates.find(t => t.id === templateId);
    
    return {
      id: templateId,
      name: template?.name || "Grupo não encontrado",
      options: template?.options || [],
      min_choices: isString ? 0 : (g as any).min_choices,
      max_choices: isString ? 1 : (g as any).max_choices,
      pricing_logic: isString ? "sum" : (g as any).pricing_logic
    };
  }).filter(g => g.options.length > 0);
  
  const [selections, setSelections] = useState<Record<string, Record<string, number>>>({});

  let totalPrice = Number(product.price || 0);

  for (const group of choiceGroups) {
    const groupSels = selections[group.id] || {};
    const selectedOptions = group.options.filter(o => (groupSels[o.id] || 0) > 0);
    if (selectedOptions.length === 0) continue;

    if (group.pricing_logic === "sum") {
      let sum = 0;
      for (const opt of selectedOptions) {
        sum += opt.price * groupSels[opt.id];
      }
      totalPrice += sum;
    } else if (group.pricing_logic === "highest") {
      const highest = Math.max(...selectedOptions.map(o => o.price));
      totalPrice += highest;
    } else if (group.pricing_logic === "average") {
      let sum = 0;
      let count = 0;
      for (const opt of selectedOptions) {
        sum += opt.price * groupSels[opt.id];
        count += groupSels[opt.id];
      }
      totalPrice += (sum / count);
    }
  }

  function adjustQuantity(groupId: string, optionId: string, maxChoices: number, delta: number) {
    setSelections(prev => {
      const gSels = prev[groupId] || {};
      const currentlySelected = Object.values(gSels).reduce((a, b) => a + b, 0);
      const currentQty = gSels[optionId] || 0;

      if (maxChoices === 1) {
        // Radio behavior
        if (delta < 0) {
           const next = { ...gSels };
           delete next[optionId];
           return { ...prev, [groupId]: next };
        }
        return { ...prev, [groupId]: { [optionId]: 1 } };
      } else {
        if (delta > 0 && currentlySelected >= maxChoices) {
          alert(`Você só pode selecionar até ${maxChoices} opções neste grupo.`);
          return prev;
        }
        const nextQty = Math.max(0, currentQty + delta);
        const next = { ...gSels };
        if (nextQty === 0) delete next[optionId];
        else next[optionId] = nextQty;

        return { ...prev, [groupId]: next };
      }
    });
  }

  function handleConfirm() {
    // Validate min_choices
    for (const group of choiceGroups) {
      const groupSels = selections[group.id] || {};
      const currentlySelected = Object.values(groupSels).reduce((a, b) => a + b, 0);
      if (group.min_choices > 0 && currentlySelected < group.min_choices) {
        alert(`Por favor, selecione no mínimo ${group.min_choices} opções em: ${group.name}`);
        return;
      }
    }

    const selectedChoices: any[] = [];
    const textParts: string[] = [];

    for (const group of choiceGroups) {
      const groupSels = selections[group.id] || {};
      const selectedOptions = group.options.filter(o => (groupSels[o.id] || 0) > 0);
      
      if (selectedOptions.length > 0) {
        const optionNames = selectedOptions.map(o => {
          const qty = groupSels[o.id];
          selectedChoices.push({
            groupId: group.id,
            groupName: group.name,
            optionId: o.id,
            optionName: o.name,
            price: o.price,
            qty
          });
          return qty > 1 ? `${qty}x ${o.name}` : o.name;
        });
        textParts.push(`${group.name}: ${optionNames.join(", ")}`);
      }
    }

    const additionsText = textParts.length > 0 ? ` (${textParts.join(" | ")})` : "";
    onConfirm(totalPrice, additionsText, selectedChoices);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center font-sans" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-border max-h-[90vh] overflow-y-auto text-left">
        <div className="sticky top-0 bg-surface flex items-center justify-between p-4 border-b border-border z-10">
          <div>
            <p className="text-[11px] uppercase text-primary font-bold tracking-wider flex items-center gap-1">
              Personalize seu pedido
            </p>
            <h3 className="font-extrabold text-white text-base mt-0.5">{product.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-6">
          {choiceGroups.map(group => {
            const gSels = selections[group.id] || {};
            const currentlySelected = Object.values(gSels).reduce((a, b) => a + b, 0);

            return (
              <section key={group.id} className="space-y-2">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <h4 className="text-xs uppercase font-extrabold text-white tracking-wider">
                      {group.name}
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-bold">
                      {group.min_choices > 0 
                        ? `Escolha de ${group.min_choices} até ${group.max_choices}` 
                        : `Escolha até ${group.max_choices} (Opcional)`}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded text-right shrink-0">
                     {currentlySelected} / {group.max_choices}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.options.map(opt => {
                    const qty = gSels[opt.id] || 0;
                    const isSelected = qty > 0;
                    return (
                      <div
                        key={opt.id}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition ${
                          isSelected 
                            ? "border-primary bg-primary/10 ring-1 ring-primary" 
                            : "border-border bg-surface-elevated"
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-sm font-bold text-white truncate">{opt.name}</span>
                          <span className="text-[11px] font-black text-primary mt-0.5">
                            {opt.price > 0 ? `+ ${brl(opt.price)}` : "Incluso"}
                          </span>
                        </div>

                        {group.max_choices === 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (!isSelected) {
                                adjustQuantity(group.id, opt.id, group.max_choices, 1);
                              } else {
                                if (group.min_choices === 0) {
                                   adjustQuantity(group.id, opt.id, group.max_choices, -1);
                                }
                              }
                            }}
                            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                              isSelected ? "border-primary bg-primary" : "border-zinc-600 bg-zinc-900"
                            }`}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-800/80 shrink-0">
                            <button
                              type="button"
                              onClick={() => adjustQuantity(group.id, opt.id, group.max_choices, -1)}
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
                              onClick={() => adjustQuantity(group.id, opt.id, group.max_choices, 1)}
                              className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center transition active:scale-90"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {group.options.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2">Nenhuma opção configurada.</p>
                  )}
                </div>
              </section>
            );
          })}
          
          {choiceGroups.length === 0 && (
             <p className="text-sm text-zinc-400 text-center py-6">Este produto não possui adicionais personalizáveis.</p>
          )}
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
