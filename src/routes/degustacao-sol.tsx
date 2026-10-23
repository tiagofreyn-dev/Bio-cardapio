import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/degustacao-sol")({
  head: () => ({
    meta: [
      { title: "Mini-Cucas Sol ☀️ — Amostra Grátis" },
      {
        name: "description",
        content: "Quem te deve essa mini cuca? Cadastre-se e resgate sua amostra grátis das Mini-Cucas Sol.",
      },
      { property: "og:title", content: "Quem te deve essa mini cuca? 🧁" },
      {
        property: "og:description",
        content: "Cadastre-se e resgate sua amostra grátis das Mini-Cucas Sol.",
      },
      {
        property: "og:image",
        content: "https://bio-cardapio.vercel.app/degustacao-quem-te-deve.jpg",
      },
    ],
  }),
  component: DegustacaoSolPage,
});

type Lead = { nome: string; phone: string; at: string };

const LEADS_KEY = "minicucas.leads";

function loadLeads(): Lead[] {
  try {
    return JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
  } catch {
    return [];
  }
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function firstName(nome: string) {
  return nome.trim().split(/\s+/)[0] || "você";
}

function DegustacaoSolPage() {
  const [nome, setNome] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<Lead | null>(null);
  const [followed, setFollowed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (!nome.trim()) return setError("Conta pra gente o seu nome 💛");
    if (digits.length < 10) return setError("Digite seu WhatsApp com DDD 📱");
    setSaving(true);
    const lead: Lead = { nome: nome.trim(), phone: digits, at: new Date().toISOString() };
    try {
      const leads = loadLeads();
      leads.push(lead);
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    } catch {}
    // Banco: 1ª tentativa com origem; se o schema estiver diferente, grava só nome+phone.
    try {
      if (supabase) {
        const first = await supabase.from("degustacao_leads").insert({
          nome: lead.nome,
          phone: lead.phone,
          origem: "degustacao-sol",
        });
        if (first.error) {
          console.error("degustacao insert (com origem):", first.error);
          const second = await supabase.from("degustacao_leads").insert({ nome: lead.nome, phone: lead.phone });
          if (second.error) console.error("degustacao insert (fallback):", second.error);
        }
      }
    } catch (err) {
      console.error("degustacao insert:", err);
    }
    setSaving(false);
    setDone(lead);
    setFollowed(false);
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {}
  }

  return (
    <div className="min-h-dvh font-sans" style={{ background: "linear-gradient(180deg,#FDF6EE 0%,#FBE9D9 45%,#F6D9C3 100%)" }}>
      <style>{`
        @keyframes sol-rise { from { opacity: 0; transform: translateY(24px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pop { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes wiggle { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
        @keyframes float-sun { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(8deg); } }
        .anim-rise { animation: sol-rise .5s ease both; }
        .anim-pop { animation: pop .45s ease both; }
        .anim-wiggle { animation: wiggle 2.4s ease-in-out infinite; }
        .anim-sun { animation: float-sun 4s ease-in-out infinite; }
      `}</style>

      <div className="mx-auto w-full max-w-md px-5 pb-10 pt-8">
        {/* Cabeçalho */}
        <header className="text-center">
          <div className="anim-sun mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-lg" style={{ background: "linear-gradient(135deg,#FFD9A8,#FFB38A)" }}>
            ☀️
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight" style={{ color: "#6B3E2E" }}>
            Mini-Cucas Sol ☀️
          </h1>
          <p className="mt-1 text-sm font-semibold" style={{ color: "#A9746E" }}>
            Feitas com carinho, quentinhas pra você
          </p>
        </header>

        {!done && (
          <figure className="anim-rise mt-5 overflow-hidden rounded-[26px] shadow-xl ring-1 ring-[#E8C9A8]">
            <img
              src="/degustacao-quem-te-deve.jpg"
              alt="Mini cuca de chocolate partida ao meio, com a frase: quem te deve essa mini cuca?"
              width={900}
              height={1125}
              loading="eager"
              decoding="async"
              className="block h-auto w-full"
            />
          </figure>
        )}

        {!done ? (
          <main className="anim-rise mt-6 rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-[#E8C9A8]">
            <p className="text-center text-sm leading-relaxed font-medium" style={{ color: "#6B3E2E" }}>
              Cadastre-se abaixo para <strong>resgatar sua amostra grátis na hora</strong> e concorrer a benefícios exclusivos! 🧁
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-extrabold uppercase tracking-wider" style={{ color: "#A9746E" }}>
                  Nome completo
                </span>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Maria Silva"
                  autoComplete="name"
                  className="h-13 w-full rounded-2xl border-2 bg-white px-4 py-3.5 text-base font-semibold outline-none placeholder:font-normal placeholder:text-[#C9A68C] focus:border-[#E8927C]"
                  style={{ borderColor: "#F0D9BE", color: "#4A2C21" }}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-extrabold uppercase tracking-wider" style={{ color: "#A9746E" }}>
                  WhatsApp
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(45) 99999-9999"
                  inputMode="tel"
                  autoComplete="tel"
                  className="h-13 w-full rounded-2xl border-2 bg-white px-4 py-3.5 text-base font-semibold outline-none placeholder:font-normal placeholder:text-[#C9A68C] focus:border-[#E8927C]"
                  style={{ borderColor: "#F0D9BE", color: "#4A2C21" }}
                />
              </label>

              {error && (
                <p className="anim-pop rounded-2xl px-4 py-3 text-center text-sm font-bold" style={{ background: "#FFE3E0", color: "#B4433A" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="anim-wiggle w-full rounded-2xl py-4 text-base font-black tracking-wide text-white shadow-lg transition active:scale-[0.98] disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#E86A5E,#C94F43)", boxShadow: "0 10px 25px rgba(200,80,65,.35)" }}
              >
                {saving ? "GUARDANDO... ✨" : "QUERO MINHA AMOSTRA GRÁTIS! 🎁"}
              </button>
              <p className="text-center text-[11px] font-medium" style={{ color: "#B98D7B" }}>
                Cadastro rapidinho • Sem spam, prometido 🤙
              </p>
            </form>
          </main>
        ) : (
          <main className="anim-rise mt-6 space-y-4">
            <div className="rounded-3xl bg-white/85 p-6 text-center shadow-xl ring-1 ring-[#E8C9A8]">
              <div className="anim-pop text-5xl">🎉</div>
              <h2 className="mt-2 text-2xl font-black" style={{ color: "#6B3E2E" }}>
                Oba, {firstName(done.nome)}! Quase lá... 😋
              </h2>
              <p className="mt-1 text-sm font-medium" style={{ color: "#A9746E" }}>
                Faltam 2 passinhos pra sua minicuca grátis:
              </p>
            </div>

            <a
              href="https://www.instagram.com/docessol26/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setFollowed(true)}
              className="anim-rise block rounded-3xl p-5 text-center text-white shadow-xl transition active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)", animationDelay: ".1s", boxShadow: "0 10px 25px rgba(221,42,123,.35)" }}
            >
              <span className="text-xs font-extrabold uppercase tracking-widest opacity-90">Passo 1 — obrigatório 📸</span>
              <span className="mt-1 block text-lg font-black">Seguir nosso Instagram @docessol26</span>
            </a>

            {followed ? (
            <div className="anim-pop rounded-3xl border-2 border-dashed bg-white/70 p-5 text-center" style={{ borderColor: "#E8927C" }}>
              <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: "#A9746E" }}>
                Passo 2 — na hora 🧁
              </span>
              <p className="mt-1 text-base font-black" style={{ color: "#6B3E2E" }}>
                Pronto pra garantir sua minicuca? Apresente esta tela pra atendente!
              </p>
              <div className="mx-auto mt-3 inline-block rounded-2xl px-5 py-2.5 text-sm font-black" style={{ background: "#FFF3E4", color: "#8A4B2F" }}>
                🎟️ {firstName(done.nome)} • {done.phone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")}
              </div>
            </div>
            ) : (
            <div className="rounded-3xl bg-white/60 p-5 text-center ring-1 ring-[#E8C9A8]">
              <p className="text-sm font-bold" style={{ color: "#A9746E" }}>
                👆 Toque no botão rosa acima pra liberar seu voucher
              </p>
            </div>
            )}
          </main>
        )}

        <footer className="mt-8 text-center">
          <p className="text-[11px] font-medium" style={{ color: "#C9A68C" }}>
            Mini-Cucas Sol ☀️ • feita à mão com amor
          </p>
        </footer>
      </div>
    </div>
  );
}
