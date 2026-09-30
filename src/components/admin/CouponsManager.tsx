import { useState } from "react";
import { storage } from "@/lib/storage";
import { useStorageSync } from "@/hooks/use-storage";
import type { Coupon } from "@/lib/types";

// Gerenciador de cupons — 100% dentro do store_data JSON (zero reads extras).
// O dono escolhe nome do desconto + % + quantidade disponível.
// 1 uso por telefone é travado na tabela coupon_uses (ver SQL).
export function CouponsManager() {
  const settings = useStorageSync(() => storage.getSettings());
  const coupons: Coupon[] = Array.isArray((settings as any).coupons)
    ? (settings as any).coupons
    : [];
  const [code, setCode] = useState("");
  const [pct, setPct] = useState("10");
  const [qty, setQty] = useState("50");

  function save(list: Coupon[]) {
    const next = { ...settings, coupons: list };
    storage.setSettings(next as any);
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
    if (!c) return alert("Dê um nome ao cupom. Ex: MAE10");
    if (coupons.some((x) => x.code === c)) return alert("Esse código já existe.");
    const p = Math.min(90, Math.max(1, Number(pct) || 10));
    const q = Math.min(10000, Math.max(1, Number(qty) || 50));
    save([...coupons, { code: c, label: c, pct: p, qty: q, used: 0, active: true }]);
    setCode("");
  }

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
      <div>
        <h4 className="font-extrabold text-sm text-white">🎟️ Cupons de desconto</h4>
        <p className="text-[11px] text-zinc-400">
          O cliente digita o código na sacola e ganha %{`%`} off. Cada telefone usa 1 vez.
          Não gasta nada do Supabase até alguém usar.
        </p>
      </div>
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Nome: MAE10"
          className="flex-1 h-10 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-xs font-bold uppercase"
        />
        <input
          value={pct}
          onChange={(e) => setPct(e.target.value)}
          type="number"
          min="1"
          max="90"
          title="% off"
          className="w-full sm:w-20 h-10 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-xs font-bold"
        />
        <input
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          type="number"
          min="1"
          max="10000"
          title="Qtd disponível"
          className="w-full sm:w-24 h-10 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-xs font-bold"
        />
        <button
          type="submit"
          className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold"
        >
          Criar
        </button>
      </form>
      {coupons.length === 0 ? (
        <p className="text-[11px] text-zinc-500">Nenhum cupom ainda. Ex: MAE10 = 10% off, 50 usos.</p>
      ) : (
        <div className="space-y-2">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white tracking-wider">{c.code}</p>
                <p className="text-[10px] text-zinc-400">
                  {c.pct}% off • {c.used}/{c.qty} usados • {c.active ? "ativo" : "pausado"}
                </p>
                <div className="h-1 rounded-full bg-zinc-800 mt-1 overflow-hidden">
                  <div
                    className="h-1 bg-primary"
                    style={{ width: `${Math.min(100, (c.used / Math.max(1, c.qty)) * 100)}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(c.code).catch(() => {});
                  alert(`Código ${c.code} copiado!`);
                }}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
              >
                Copiar
              </button>
              <button
                type="button"
                onClick={() =>
                  save(coupons.map((x) => (x.code === c.code ? { ...x, active: !x.active } : x)))
                }
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
              >
                {c.active ? "Pausar" : "Ativar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!confirm(`Apagar cupom ${c.code}?`)) return;
                  save(coupons.filter((x) => x.code !== c.code));
                }}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-500 hover:text-black"
              >
                Apagar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
