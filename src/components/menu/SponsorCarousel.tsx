import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Sponsor {
  id: string;
  nome: string;
  slogan: string;
  emoji: string;
  gradient: string;
  image_url?: string;
}

// Fallback local (exibido se o banco ainda não tiver patrocinados ou se o
// SQL do master ainda não foi executado). O master gerencia os reais na
// aba Patrocinados do /master-admin.
const MOCK_SPONSORS: Sponsor[] = [
  {
    id: "1",
    nome: "Barbearia Corte Fino",
    slogan: "Corte + barba R$ 50 • Seg a Sáb",
    emoji: "💈",
    gradient: "from-sky-600 via-blue-700 to-indigo-900",
  },
  {
    id: "2",
    nome: "Pizzaria Forno a Lenha",
    slogan: "Rodízio R$ 49,90 • Delivery até 23h",
    emoji: "🍕",
    gradient: "from-red-600 via-orange-600 to-amber-700",
  },
  {
    id: "3",
    nome: "Academia Corpo Ativo",
    slogan: "1ª semana grátis • Musculação + Cross",
    emoji: "💪",
    gradient: "from-emerald-600 via-green-700 to-lime-800",
  },
  {
    id: "4",
    nome: "Pet Shop AuAu",
    slogan: "Banho + tosa com 20% OFF",
    emoji: "🐶",
    gradient: "from-violet-600 via-purple-700 to-fuchsia-800",
  },
  {
    id: "5",
    nome: "Sorveteria Gelada",
    slogan: "2º pote com 50% OFF hoje",
    emoji: "🍨",
    gradient: "from-cyan-500 via-sky-600 to-blue-800",
  },
  {
    id: "6",
    nome: "Farmácia Saúde+",
    slogan: "Entrega grátis em 30 min",
    emoji: "💊",
    gradient: "from-teal-600 via-emerald-700 to-green-900",
  },
];

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const photo =
    typeof sponsor.image_url === "string" &&
    (sponsor.image_url.startsWith("http") || sponsor.image_url.startsWith("/"))
      ? sponsor.image_url
      : null;
  return (
    <div
      className={`relative w-[260px] sm:w-[300px] h-[86px] shrink-0 rounded-xl overflow-hidden bg-gradient-to-r ${sponsor.gradient} ring-1 ring-white/15 shadow-md select-none`}
    >
      {/* brilho de outdoor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
      <div className="relative h-full flex items-center gap-3 px-3.5">
        {photo ? (
          <img
            src={photo}
            alt={sponsor.nome}
            className="w-12 h-12 rounded-lg object-cover shrink-0 ring-1 ring-white/20 bg-black/30"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-black/30 backdrop-blur flex items-center justify-center text-2xl shrink-0 ring-1 ring-white/20">
            {sponsor.emoji}
          </div>
        )}
        <div className="min-w-0 text-left">
          <p className="text-white font-black text-[13px] leading-tight truncate">
            {sponsor.nome}
          </p>
          <p className="text-white/80 text-[11px] leading-tight truncate mt-0.5">
            {sponsor.slogan}
          </p>
          <span className="inline-block mt-1 text-[8px] font-black uppercase tracking-[0.15em] text-white/60 bg-black/25 px-1.5 py-0.5 rounded">
            Patrocinado
          </span>
        </div>
      </div>
    </div>
  );
}

export function SponsorCarousel() {
  const [sponsors, setSponsors] = useState<Sponsor[]>(MOCK_SPONSORS);
  const [isLive, setIsLive] = useState(false);

  // ULTRA-LEVE: 1 select projetado, cache 10min em sessionStorage.
  // Ativo no cardápio: o master liga/desliga na aba 📢 Patrocinados.
  useEffect(() => {
    if (!supabase) return;
    try {
      const raw = sessionStorage.getItem("insano.sponsors.cache");
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && Date.now() - cached.at < 10 * 60 * 1000 && Array.isArray(cached.items) && cached.items.length > 0) {
          setSponsors(cached.items);
          setIsLive(true);
          return;
        }
      }
    } catch {}
    (async () => {
      try {
        const { data, error } = await supabase
          .from("sponsor_banners")
          .select("id,nome,slogan,emoji,gradient,image_url")
          .eq("active", true)
          .order("position", { ascending: true })
          .limit(12);
        if (error) throw error;
        if (data && data.length > 0) {
          setSponsors(data as Sponsor[]);
          setIsLive(true);
          try {
            sessionStorage.setItem("insano.sponsors.cache", JSON.stringify({ at: Date.now(), items: data }));
          } catch {}
        }
      } catch {
        // Tabela ainda não criada ou sem linhas: mantém o mock visual.
      }
    })();
  }, []);

  // Duplica a lista pra fazer o loop infinito sem "pulo"
  const loop = [...sponsors, ...sponsors];

  return (
    <section aria-label="Patrocinadores" className="pt-3">
      <p className="px-4 mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Parceiros da casa{isLive ? "" : " • demo"}
      </p>
      <div className="overflow-hidden sponsor-mask">
        <div className="flex gap-3 w-max px-4 animate-sponsor-marquee sponsor-pause">
          {loop.map((s, i) => (
            <SponsorCard key={`${s.id}-${i}`} sponsor={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
