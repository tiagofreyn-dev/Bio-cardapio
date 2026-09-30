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
      className={`relative w-[280px] sm:w-[360px] h-[160px] sm:h-[200px] shrink-0 snap-start rounded-2xl overflow-hidden bg-gradient-to-r ${sponsor.gradient} ring-1 ring-white/15 shadow-lg select-none transition-transform duration-300 hover:scale-[1.03] focus-within:scale-[1.03]`}
    >
      {photo ? (
        <img
          src={photo}
          alt={sponsor.nome}
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-6xl">
          {sponsor.emoji}
        </div>
      )}
      {/* sombra estilo Fire TV pra leitura do título */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="absolute bottom-0 inset-x-0 p-3.5 text-left">
        <p className="text-white font-black text-base sm:text-lg leading-tight truncate drop-shadow">
          {sponsor.nome}
        </p>
        <p className="text-white/80 text-xs leading-tight truncate mt-0.5">
          {sponsor.slogan}
        </p>
        <span className="inline-block mt-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white/70 bg-black/40 backdrop-blur px-2 py-0.5 rounded-md ring-1 ring-white/10">
          Patrocinado
        </span>
      </div>
    </div>
  );
}

function dedupeSponsors(items: Sponsor[]): Sponsor[] {
  const byId = new Map<string, Sponsor>();
  for (const s of items) {
    if (!s) continue;
    // chave forte: id; fallback: nome+imagem pra pegar duplicata real do banco
    const key = s.id || `${s.nome}|${s.image_url || ""}|${s.slogan || ""}`;
    if (!byId.has(key)) byId.set(key, s);
  }
  // segunda passada: remove mesma imagem+nome com ids diferentes (cadastro duplo)
  const seen = new Set<string>();
  const out: Sponsor[] = [];
  for (const s of byId.values()) {
    const dupKey = `${(s.nome || "").toLowerCase().trim()}|${(s.image_url || "").trim()}`;
    if (seen.has(dupKey)) continue;
    seen.add(dupKey);
    out.push(s);
  }
  return out;
}

export function SponsorCarousel() {
  const [sponsors, setSponsors] = useState<Sponsor[]>(MOCK_SPONSORS);
  const [isLive, setIsLive] = useState(false);

  // ULTRA-LEVE: 1 select projetado, cache 10min em sessionStorage.
  // Ativo no cardápio: o master liga/desliga na aba 📢 Patrocinados.
  // Stale-while-revalidate: mostra o cache na hora MAS busca o fresco em
  // segundo plano — antes o `return` precoce travava em 1 item por 10min
  // depois que o master adicionava o 2º parceiro.
  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    let alive = true;
    async function fetchLive() {
      if (!sb) return;
      try {
        const { data, error } = await sb
          .from("sponsor_banners")
          .select("id,nome,slogan,emoji,gradient,image_url")
          .eq("active", true)
          .order("position", { ascending: true })
          .limit(12);
        if (error) throw error;
        if (data && data.length > 0 && alive) {
          const unique = dedupeSponsors(data as Sponsor[]);
          setSponsors(unique);
          setIsLive(true);
          try {
            sessionStorage.setItem("insano.sponsors.cache", JSON.stringify({ at: Date.now(), items: unique }));
          } catch {}
        } else if (alive && data && data.length === 0) {
          // Banco vazio de verdade: volta pro demo em vez de travar no cache velho
          try { sessionStorage.removeItem("insano.sponsors.cache"); } catch {}
        }
      } catch {
        // Tabela ainda não criada ou sem linhas: mantém o mock visual.
      }
    }
    try {
      const raw = sessionStorage.getItem("insano.sponsors.cache");
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && Date.now() - cached.at < 10 * 60 * 1000 && Array.isArray(cached.items) && cached.items.length > 0) {
          setSponsors(dedupeSponsors(cached.items));
          setIsLive(true);
          // Não retorna: revalida em segundo plano pra pegar o 2º parceiro novo
          void fetchLive();
          // Revalida de novo ao voltar o foco (master adicionou em outra aba)
          const onFocus = () => void fetchLive();
          window.addEventListener("focus", onFocus);
          return () => {
            alive = false;
            window.removeEventListener("focus", onFocus);
          };
        }
      }
    } catch {}
    void fetchLive();
    return () => {
      alive = false;
    };
  }, []);

  // Sem duplicatas reais. O loop infinito só é ligado com 4+ itens —
  // com 1-3 parceiros o marquee duplicado parecia "bug duplicado" no print.
  const unique = dedupeSponsors(sponsors);
  const useMarquee = unique.length >= 4;
  const loop = useMarquee ? [...unique, ...unique] : unique;

  if (unique.length === 0) return null;

  return (
    <section aria-label="Patrocinadores" className="pt-3">
      <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Parceiros da casa{isLive ? "" : " • demo"}
      </p>
      {useMarquee ? (
        <div className="overflow-hidden sponsor-mask">
          <div className="flex gap-4 w-max px-4 animate-sponsor-marquee sponsor-pause">
            {loop.map((s, i) => (
              <SponsorCard key={`${s.id}-${i}`} sponsor={s} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto px-4 pb-1 no-scrollbar snap-x">
          {unique.map((s) => (
            <SponsorCard key={s.id} sponsor={s} />
          ))}
        </div>
      )}
    </section>
  );
}
