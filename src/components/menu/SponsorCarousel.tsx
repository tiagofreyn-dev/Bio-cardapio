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

// Sem fallback fictício: se o master não tem patrocinados cadastrados,
// a seção nem aparece no cardápio (antes mostrava 6 mocks "demo").

function SponsorCard({ sponsor, onExpand }: { sponsor: Sponsor; onExpand: () => void }) {
  const photo =
    typeof sponsor.image_url === "string" &&
    (sponsor.image_url.startsWith("http") || sponsor.image_url.startsWith("/"))
      ? sponsor.image_url
      : null;
  return (
    <button
      type="button"
      onClick={onExpand}
      title="Clique para ampliar"
      className={`relative block text-left w-[280px] sm:w-[360px] h-[160px] sm:h-[200px] shrink-0 snap-start rounded-2xl overflow-hidden bg-gradient-to-r ${sponsor.gradient} ring-1 ring-white/15 shadow-lg select-none transition-transform duration-300 hover:scale-[1.03] cursor-zoom-in`}
    >
      {photo ? (
        <img
          src={photo}
          alt={sponsor.nome}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-6xl pointer-events-none">
          {sponsor.emoji}
        </div>
      )}
      {/* sombra estilo Fire TV pra leitura do título */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />
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
      <span className="absolute top-2 right-2 text-[10px] font-bold bg-black/60 text-white px-2 py-1 rounded-lg backdrop-blur">
        ⤢
      </span>
    </button>
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
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
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

  const [expanded, setExpanded] = useState<Sponsor | null>(null);

  // Fecha o ampliar com Esc
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const unique = dedupeSponsors(sponsors);
  // SEMPRE passando pro lado: repete a lista até encher a tela (mín. 6)
  // e duplica pra costura infinita do marquee (-50%). Com 1-2 parceiros
  // a repetição é proposital pro desfile não ficar parado/vazio.
  let filled = [...unique];
  while (filled.length > 0 && filled.length < 6) filled = [...filled, ...unique];
  const loop = [...filled, ...filled];

  if (unique.length === 0) return null;

  const expandPhoto =
    expanded &&
    typeof expanded.image_url === "string" &&
    (expanded.image_url.startsWith("http") || expanded.image_url.startsWith("/"))
      ? expanded.image_url
      : null;

  return (
    <>
      <section aria-label="Patrocinadores" className="pt-3">
        <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Parceiros da casa{isLive ? "" : " • demo"}
        </p>
        <div className="overflow-hidden sponsor-mask">
          <div className="flex gap-4 w-max px-4 animate-sponsor-marquee sponsor-pause">
            {loop.map((s, i) => (
              <SponsorCard key={`${s.id}-${i}`} sponsor={s} onExpand={() => setExpanded(s)} />
            ))}
          </div>
        </div>
      </section>

      {/* Ampliar parceiro: anúncio por completo, sem corte */}
      {expanded && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setExpanded(null)}
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setExpanded(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-xl hover:bg-white/20"
          >
            ×
          </button>
          <div
            className={`relative w-full max-w-lg rounded-2xl overflow-hidden bg-gradient-to-r ${expanded.gradient} ring-1 ring-white/20 shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {expandPhoto ? (
              <img
                src={expandPhoto}
                alt={expanded.nome}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
            ) : (
              <div className="w-full h-56 flex items-center justify-center text-8xl">
                {expanded.emoji}
              </div>
            )}
            <div className="p-5 bg-black/60">
              <p className="text-white font-black text-xl leading-tight">{expanded.nome}</p>
              <p className="text-white/80 text-sm mt-1">{expanded.slogan}</p>
              <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/70 bg-white/10 px-2 py-1 rounded-md ring-1 ring-white/10">
                Patrocinado
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
