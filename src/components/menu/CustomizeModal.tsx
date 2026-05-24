import { useState } from "react";
import type { Product } from "@/lib/types";
import { brl } from "@/lib/format";
import { X } from "lucide-react";
import { storage } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";
import { useTenant } from "@/lib/tenant";

interface ToppingOption {
  name: string;
  price: number;
}

const TOPPING_CATEGORIES: { category: string; icon: string; items: ToppingOption[] }[] = [
  {
    category: "Frutas",
    icon: "🍓",
    items: [
      { name: "Banana", price: 3.00 },
      { name: "Maçã", price: 3.00 },
      { name: "Morango", price: 4.80 },
      { name: "Kiwi", price: 5.80 },
      { name: "Abacaxi", price: 4.00 },
      { name: "Manga", price: 3.50 }
    ]
  },
  {
    category: "Derivados do Leite",
    icon: "🥛",
    items: [
      { name: "Leite Condensado", price: 3.80 },
      { name: "Leite em Pó", price: 3.80 }
    ]
  },
  {
    category: "Diversos & Cereais",
    icon: "🥣",
    items: [
      { name: "Amendoim", price: 3.00 },
      { name: "Paçoca", price: 3.00 },
      { name: "Coco Ralado", price: 3.00 },
      { name: "Óreo", price: 3.00 },
      { name: "Granola", price: 3.50 },
      { name: "Sucrilhos", price: 3.50 }
    ]
  },
  {
    category: "Chocolates",
    icon: "🍫",
    items: [
      { name: "Bis Branco", price: 2.90 },
      { name: "Bis Preto", price: 2.80 },
      { name: "Ouro Branco", price: 3.50 },
      { name: "Sonho de Valsa", price: 3.50 },
      { name: "Kit Kat", price: 4.50 },
      { name: "Granulado", price: 3.80 },
      { name: "Raspa de Chocolate", price: 3.80 },
      { name: "Laka", price: 3.80 },
      { name: "Chocoball", price: 3.80 },
      { name: "Nutella", price: 6.00 },
      { name: "Ovomaltine", price: 4.00 },
      { name: "Confete", price: 4.00 }
    ]
  },
  {
    category: "Coberturas",
    icon: "🍯",
    items: [
      { name: "Cobertura de Chocolate", price: 2.80 },
      { name: "Cobertura de Morango", price: 2.80 },
      { name: "Cobertura de Limão", price: 2.80 }
    ]
  },
  {
    category: "Mousses",
    icon: "🍧",
    items: [
      { name: "Mousse de Maracujá", price: 4.80 },
      { name: "Mousse de Morango", price: 4.80 }
    ]
  },
  {
    category: "Cremes",
    icon: "🍦",
    items: [
      { name: "Creme de Ninho", price: 6.00 },
      { name: "Creme de Laka Branco", price: 6.00 },
      { name: "Creme de Trufas", price: 6.00 },
      { name: "Creme de Kinder Bueno", price: 6.00 },
      { name: "Creme de Coco", price: 6.00 },
      { name: "Creme de Prestígio", price: 6.00 },
      { name: "Creme de Ferrero Rocher", price: 8.90 }
    ]
  }
];

const MILKSHAKE_FLAVORS = [
  "Ovomaltine", "Ferrero Rocher", "Nutela", "Laka", "Sonho de Valsa", 
  "Óreo", "Ouro Branco", "Maracujá", "Chocolate", "Morango", 
  "Côco", "Pistache", "Flocos", "Limão", "Ninho"
];

export function CustomizeModal({
  product,
  onClose,
  onConfirm,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: (opts: { 
    lettuce?: "Alface Tradicional" | "Alface Americana"; 
    ketchup?: number; 
    mayo?: number;
    toppings?: string[];
  }) => void;
}) {
  const { tenant } = useTenant();
  const settings = useStorageSync(() => storage.getSettings());
  const isAcaiShop = tenant?.slug.includes("acai") ?? false;

  // Lógica de hambúrguer
  const mayoPrice = settings.mayoPrice ?? 2.00;
  const showLettuce = product.hasLettuceOption ?? product.customizable;
  const showKetchup = product.hasKetchupOption ?? product.customizable;
  const showMayo = product.hasMayoOption ?? product.customizable;

  const [lettuce, setLettuce] = useState<"Alface Tradicional" | "Alface Americana">("Alface Tradicional");
  const [ketchup, setKetchup] = useState(0);
  const [mayo, setMayo] = useState(0);

  // Lógica de Açaí
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [activeTab, setActiveTab] = useState(TOPPING_CATEGORIES[0].category);

  // Lógica de Milk-Shake
  const [selectedFlavor, setSelectedFlavor] = useState<string>("Ovomaltine");

  const totalToppingsPrice = selectedToppings.reduce((s, t) => s + t.price, 0);

  function handleToggleTopping(top: ToppingOption) {
    setSelectedToppings((current) =>
      current.some((t) => t.name === top.name)
        ? current.filter((t) => t.name !== top.name)
        : [...current, top]
    );
  }

  const renderContent = () => {
    // 1. Se for Loja de Açaí e o produto for Açaí
    if (isAcaiShop && product.category === "acai") {
      return (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Escolha os seus adicionais favoritos pagos. O valor será somado ao total.
          </p>

          {/* Abas das Categorias de Adicionais */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-border">
            {TOPPING_CATEGORIES.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setActiveTab(cat.category)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
                  activeTab === cat.category
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-elevated text-muted-foreground ring-1 ring-border"
                }`}
              >
                {cat.icon} {cat.category}
              </button>
            ))}
          </div>

          {/* Lista de Adicionais da Categoria Ativa */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {TOPPING_CATEGORIES.find((cat) => cat.category === activeTab)?.items.map((top) => {
              const isSelected = selectedToppings.some((t) => t.name === top.name);
              return (
                <label
                  key={top.name}
                  className={`flex items-center justify-between p-3 rounded-xl ring-1 cursor-pointer transition ${
                    isSelected ? "ring-primary bg-primary/10" : "ring-border bg-surface-elevated hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleTopping(top)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm font-semibold">{top.name}</span>
                  </div>
                  <span className="text-xs text-primary font-bold">+{brl(top.price)}</span>
                </label>
              );
            })}
          </div>

          {/* Adicionais selecionados (resumo rápido) */}
          {selectedToppings.length > 0 && (
            <div className="p-3 rounded-xl bg-surface-elevated/50 ring-1 ring-border text-xs space-y-1">
              <span className="font-bold text-muted-foreground">Selecionados:</span>
              <p className="text-zinc-300 leading-relaxed font-semibold">
                {selectedToppings.map((t) => t.name).join(", ")}
              </p>
            </div>
          )}
        </div>
      );
    }

    // 2. Se for Loja de Açaí e o produto for Milk-Shake
    if (isAcaiShop && product.category === "milkshake") {
      return (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold mb-1">Escolha o Sabor <span className="text-destructive">*</span></h4>
            <p className="text-xs text-muted-foreground mb-3">Selecione um sabor de milkshake:</p>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {MILKSHAKE_FLAVORS.map((flav) => (
              <label
                key={flav}
                className={`flex items-center gap-2.5 p-3 rounded-xl ring-1 cursor-pointer transition ${
                  selectedFlavor === flav ? "ring-primary bg-primary/10" : "ring-border bg-surface-elevated hover:bg-zinc-800"
                }`}
              >
                <input
                  type="radio"
                  name="milkshake-flavor"
                  checked={selectedFlavor === flav}
                  onChange={() => setSelectedFlavor(flav)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-xs font-bold truncate">{flav}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // 3. Fallback para Hambúrguer/Lanches
    return (
      <div className="space-y-5">
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
              <button type="button" onClick={() => setKetchup((k) => Math.max(0, k - 1))} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><MinusBtn /></button>
              <span className="w-6 text-center font-bold">{ketchup}</span>
              <button type="button" onClick={() => setKetchup((k) => Math.min(5, k + 1))} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><PlusBtn /></button>
            </div>
          </section>
        )}

        {showMayo && (
          <section>
            <h4 className="text-sm font-bold mb-1">Potes extras de Maionese Verde</h4>
            <p className="text-[11px] text-muted-foreground mb-2">De 0 a 5 unidades (+{brl(mayoPrice)} cada)</p>
            <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-elevated ring-1 ring-border w-fit">
              <button type="button" onClick={() => setMayo((m) => Math.max(0, m - 1))} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><MinusBtn /></button>
              <span className="w-6 text-center font-bold">{mayo}</span>
              <button type="button" onClick={() => setMayo((m) => Math.min(5, m + 1))} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><PlusBtn /></button>
            </div>
          </section>
        )}
      </div>
    );
  };

  const finalComputedPrice = () => {
    if (isAcaiShop && product.category === "acai") {
      return product.price + totalToppingsPrice;
    }
    if (isAcaiShop && product.category === "milkshake") {
      return product.price;
    }
    return (
      product.price + 
      (showMayo ? mayo * mayoPrice : 0) + 
      (showKetchup && ketchup > 2 ? (ketchup - 2) * 0.50 : 0)
    );
  };

  const handleConfirmAction = () => {
    if (isAcaiShop && product.category === "acai") {
      onConfirm({
        toppings: selectedToppings.map((t) => `${t.name} (+${brl(t.price)})`)
      });
    } else if (isAcaiShop && product.category === "milkshake") {
      onConfirm({
        toppings: [`Sabor: ${selectedFlavor}`]
      });
    } else {
      onConfirm({
        lettuce: showLettuce ? lettuce : undefined,
        ketchup: showKetchup ? ketchup : undefined,
        mayo: showMayo ? mayo : undefined
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-border max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
        <div className="sticky top-0 z-10 bg-surface flex items-center justify-between p-4 border-b border-border">
          <div>
            <p className="text-[10px] uppercase text-primary font-black tracking-widest">Customização</p>
            <h3 className="font-extrabold text-base">{product.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-primary transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {renderContent()}
        </div>

        <div className="sticky bottom-0 p-4 bg-surface border-t border-border mt-auto">
          <button
            onClick={handleConfirmAction}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-[0_4px_16px_var(--primary)] active:scale-[0.99] transition flex items-center justify-center gap-1.5"
          >
            Confirmar e Adicionar — {brl(finalComputedPrice())}
          </button>
        </div>
      </div>
    </div>
  );
}

function MinusBtn() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  );
}

function PlusBtn() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  );
}
