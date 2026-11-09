import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { brl } from "@/lib/format";
import { X, Minus, Plus, Check } from "lucide-react";

/**
 * "Monte seu combo" — feito para produtos vendidos por quantidade com sabor
 * em cada unidade (mini cucas, cupcakes, doces...).
 *
 * Fluxo: 1) escolhe a faixa (1 un R$5 / 2 un R$9 / 5 un R$20)
 *         2) distribui os sabores entre as unidades
 *         3) confirma — o WhatsApp da loja recebe "Mini Cuca (5 un)" com
 *            "Sabores: 3x Chocolate, 2x Coco".
 */
export function FlavorComboModal({
  product,
  onClose,
  onConfirm,
  restantes,
  limitar,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: (
    finalPrice: number,
    additionsText: string,
    selectedChoices: any[],
    meta?: { units?: number },
  ) => void;
  /** Unidades que ainda restam HOJE por sabor (lote anunciado − vendidos). */
  restantes?: Record<string, number>;
  /** false = encomenda p/ amanhã (produção sob demanda): não trava por sabor. */
  limitar?: boolean;
}) {
  const combos = useMemo(
    () =>
      [...(product.combos || [])]
        .map((c) => ({
          qty: Math.max(1, Math.round(Number(c?.qty) || 1)),
          price: Math.max(0, Number(c?.price) || 0),
        }))
        .sort((a, b) => a.qty - b.qty),
    [product.combos],
  );

  const flavors = useMemo(
    () =>
      (product.sabores || [])
        .map((s: any) =>
          typeof s === "string"
            ? { nome: String(s).trim(), extra: 0 }
            : { nome: String(s?.nome || "").trim(), extra: Math.max(0, Number(s?.extra) || 0) },
        )
        .filter((s: { nome: string }) => s.nome),
    [product.sabores],
  );

  const [comboIdx, setComboIdx] = useState(0);
  const [sel, setSel] = useState<Record<string, number>>({});
  // Unidades a MAIS que a faixa escolhida, mantendo o preço por unidade do combo.
  const [extrasQtd, setExtrasQtd] = useState(0);

  // Estoque por sabor do lote de HOJE. Sabor sem `stock` numérico = sem limite.
  const limiteDe = (nome: string): number => {
    if (!limitar || !restantes) return Infinity;
    const v = restantes[nome];
    return typeof v === "number" ? Math.max(0, v) : Infinity;
  };
  const totalRestante = flavors.reduce((soma, f) => {
    const lim = limiteDe(f.nome);
    return soma + (lim === Infinity ? 9999 : lim);
  }, 0);

  const combo = combos[Math.min(comboIdx, combos.length - 1)] || {
    qty: 1,
    price: Number(product.price) || 0,
  };
  // Preço por unidade da faixa escolhida — é ele que continua valendo nas
  // unidades extras (combo de 4 un R$24 = R$6 cada; pedir 6 un = 6 × R$6).
  const unitCombo = combo.qty > 0 ? Math.round((combo.price / combo.qty) * 100) / 100 : 0;
  const totalUnidades = combo.qty + extrasQtd;
  // Limite de extras: hoje respeita o lote por sabor; encomenda vai até 99.
  const maxExtras = limitar ? Math.max(0, Math.min(totalRestante, 9999) - combo.qty) : 99;
  const chosen = Object.values(sel).reduce((a, b) => a + b, 0);
  const faltam = Math.max(0, totalUnidades - chosen);

  // Economia mostrada ao lado do combo (comparando com a faixa de 1 unidade).
  const baseUnit = (combos.find((c) => c.qty === 1)?.price ?? Number(product.price)) || 0;
  const economia = Math.max(0, baseUnit * combo.qty - combo.price);

  const extras = flavors.reduce((sum, f) => sum + (sel[f.nome] || 0) * (f.extra || 0), 0);
  const extrasValue = extrasQtd * unitCombo;
  const total = combo.price + extrasValue + extras;

  function pickCombo(i: number) {
    if (i === comboIdx) return;
    setComboIdx(i);
    setSel({});
    setExtrasQtd(0);
  }

  // Muda as unidades extras e, se precisar, devolve os sabores que sobrarem.
  function setExtras(next: number) {
    const clamped = Math.max(0, Math.min(maxExtras, Math.round(next) || 0));
    setExtrasQtd(clamped);
    const cap = combo.qty + clamped;
    setSel((prev) => {
      let excess = Object.values(prev).reduce((a, b) => a + b, 0) - cap;
      if (excess <= 0) return prev;
      const copy = { ...prev };
      for (const f of [...flavors].reverse()) {
        if (excess <= 0) break;
        const cur = copy[f.nome] || 0;
        if (!cur) continue;
        const take = Math.min(cur, excess);
        const left = cur - take;
        if (left === 0) delete copy[f.nome];
        else copy[f.nome] = left;
        excess -= take;
      }
      return copy;
    });
  }

  function adjust(nome: string, delta: number) {
    const lim = limiteDe(nome);
    const atual = sel[nome] || 0;
    if (delta > 0) {
      if (atual >= lim) {
        alert(
          lim <= 0
            ? `O sabor ${nome} esgotou no lote de hoje. Escolha outro ou encomende para amanhã.`
            : `Só restam ${lim} de ${nome} hoje.`,
        );
        return;
      }
      if (chosen >= totalUnidades) {
        alert(
          `Você já escolheu ${totalUnidades} de ${totalUnidades} mini cucas. Tire 1 de um sabor para trocar.`,
        );
        return;
      }
    }
    const next = Math.max(0, atual + delta);
    setSel((prev) => {
      const copy = { ...prev };
      if (next === 0) delete copy[nome];
      else copy[nome] = next;
      return copy;
    });
  }

  function handleConfirm() {
    if (chosen !== totalUnidades) {
      alert(
        `Escolha o sabor de ${totalUnidades} mini cuca${totalUnidades > 1 ? "s" : ""}. Você escolheu ${chosen}.`,
      );
      return;
    }
    const selectedChoices = flavors
      .filter((f) => (sel[f.nome] || 0) > 0)
      .map((f) => ({
        groupId: "sabores",
        groupName: "Sabores",
        optionId: f.nome,
        optionName: f.nome,
        price: f.extra || 0,
        qty: sel[f.nome],
      }));
    onConfirm(total, ` (${totalUnidades} un)`, selectedChoices, { units: totalUnidades });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center font-sans"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl ring-1 ring-border max-h-[92vh] flex flex-col text-left"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <p className="text-[11px] uppercase text-primary font-bold tracking-wider">
              Monte seu combo
            </p>
            <h3 className="font-extrabold text-white text-base mt-0.5">{product.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto">
          {/* 1) Quantidade */}
          <section className="space-y-2">
            <h4 className="text-xs uppercase font-extrabold text-white tracking-wider">
              1. Quantas você quer?
            </h4>
            <div className="space-y-2">
              {combos.map((c, i) => {
                const active = i === Math.min(comboIdx, combos.length - 1);
                const unit = c.qty > 0 ? c.price / c.qty : 0;
                const save = Math.max(0, baseUnit * c.qty - c.price);
                const semLote = !!limitar && totalRestante < c.qty;
                return (
                  <button
                    key={`${c.qty}-${i}`}
                    type="button"
                    disabled={semLote}
                    onClick={() => pickCombo(i)}
                    className={`w-full flex items-center justify-between gap-2 p-3.5 rounded-2xl border text-left transition ${
                      active
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border bg-surface-elevated"
                    } ${semLote ? "opacity-45" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          active ? "border-primary bg-primary" : "border-zinc-600 bg-zinc-900"
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                      </span>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-black text-white">
                          {c.qty} {c.qty > 1 ? "unidades" : "unidade"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {semLote
                            ? `só restam ${totalRestante} hoje`
                            : `${brl(unit)} cada${save > 0 ? ` • economize ${brl(save)}` : ""}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-primary font-extrabold whitespace-nowrap">
                      {brl(c.price)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Unidades extras mantendo o preço por unidade do combo. */}
            <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black text-white">Quer mais unidades?</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {maxExtras > 0
                      ? `Adicione mantendo ${brl(unitCombo)} cada.`
                      : limitar
                        ? "O lote de hoje não tem mais unidades disponíveis."
                        : "Sem limite de unidades extras."}
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-800/80 shrink-0">
                  <button
                    type="button"
                    onClick={() => setExtras(extrasQtd - 1)}
                    disabled={extrasQtd === 0}
                    aria-label="Tirar uma unidade extra"
                    className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 disabled:opacity-40 flex items-center justify-center transition active:scale-90"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black text-white w-4 text-center select-none">
                    {extrasQtd}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtras(extrasQtd + 1)}
                    disabled={extrasQtd >= maxExtras}
                    aria-label="Adicionar uma unidade extra"
                    className="w-7 h-7 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 flex items-center justify-center transition active:scale-90"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {extrasQtd > 0 && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-primary/20 text-[11px] font-bold">
                  <span className="text-emerald-400">
                    {totalUnidades} unidades • {brl(unitCombo)} cada
                  </span>
                  <span className="text-primary whitespace-nowrap">+ {brl(extrasValue)}</span>
                </div>
              )}
            </div>
          </section>

          {/* 2) Sabores */}
          <section className="space-y-2">
            <div className="flex items-end justify-between gap-2">
              <div>
                <h4 className="text-xs uppercase font-extrabold text-white tracking-wider">
                  2. Escolha os sabores
                </h4>
                <span className="text-[10px] text-zinc-400 font-bold">
                  Distribua {totalUnidades} {totalUnidades > 1 ? "sabores" : "sabor"} entre as
                  unidades
                </span>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded shrink-0 ${
                  faltam === 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-primary/10 text-primary"
                }`}
              >
                {chosen} / {totalUnidades}
              </span>
            </div>

            {flavors.length === 0 && (
              <p className="text-xs text-muted-foreground py-2">Nenhum sabor cadastrado.</p>
            )}

            <div className="space-y-2">
              {flavors.map((f) => {
                const qty = sel[f.nome] || 0;
                const isSelected = qty > 0;
                const lim = limiteDe(f.nome);
                const semEstoque = lim <= 0;
                const noLimite = qty >= lim;
                return (
                  <div
                    key={f.nome}
                    onClick={
                      totalUnidades === 1
                        ? () => {
                            if (!semEstoque) setSel({ [f.nome]: 1 });
                          }
                        : undefined
                    }
                    role={totalUnidades === 1 ? "button" : undefined}
                    aria-pressed={totalUnidades === 1 ? isSelected : undefined}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border bg-surface-elevated"
                    } ${semEstoque ? "opacity-45" : ""} ${
                      totalUnidades === 1 && !semEstoque ? "cursor-pointer" : ""
                    }`}
                  >
                    <button
                      type="button"
                      disabled={semEstoque}
                      onClick={() => {
                        // Total de 1 unidade: tocar no sabor já seleciona.
                        if (totalUnidades === 1) {
                          if (semEstoque) return;
                          setSel({ [f.nome]: 1 });
                        } else adjust(f.nome, 1);
                      }}
                      className="flex flex-col min-w-0 pr-2 text-left disabled:cursor-not-allowed"
                    >
                      <span className="text-sm font-bold text-white truncate">{f.nome}</span>
                      {f.extra > 0 && (
                        <span className="text-[11px] font-black text-primary mt-0.5">
                          + {brl(f.extra)} por unidade
                        </span>
                      )}
                      {Number.isFinite(lim) && (
                        <span
                          className={`text-[10px] font-bold mt-0.5 ${
                            semEstoque
                              ? "text-rose-400"
                              : lim <= 3
                                ? "text-amber-400"
                                : "text-zinc-500"
                          }`}
                        >
                          {semEstoque ? "esgotou hoje" : `restam ${lim} hoje`}
                        </span>
                      )}
                    </button>

                    {totalUnidades === 1 ? (
                      <span
                        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? "border-primary bg-primary" : "border-zinc-600 bg-zinc-900"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full" />
                        )}
                      </span>
                    ) : (
                      <div className="flex items-center gap-3 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-800/80 shrink-0">
                        <button
                          type="button"
                          onClick={() => adjust(f.nome, -1)}
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
                          onClick={() => adjust(f.nome, 1)}
                          disabled={semEstoque || noLimite}
                          className="w-7 h-7 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 flex items-center justify-center transition active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {economia > 0 && (
              <p className="text-[11px] font-bold text-emerald-400 text-center pt-1">
                🎉 Esse combo já economiza {brl(economia)} pra você!
              </p>
            )}
          </section>
        </div>

        <div className="sticky bottom-0 p-4 bg-surface border-t border-border">
          <button
            onClick={handleConfirm}
            disabled={faltam > 0}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black shadow-[0_6px_20px_oklch(0.62_0.22_22/0.5)] active:scale-[0.99] transition text-sm disabled:opacity-50"
          >
            {faltam > 0
              ? `Escolha mais ${faltam} sabor${faltam > 1 ? "es" : ""}`
              : `Adicionar — ${brl(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
