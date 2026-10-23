import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { isoDate, parseIso } from "@/lib/encomenda";
import {
  type Coord,
  type PedidoApp,
  type Parada,
  agregarProducao,
  dataDoPedido,
  enderecoDoPedido,
  formatarTelefone,
  geocodificar,
  itensCurto,
  janelaDoPedido,
  linkMapa,
  linksDaRota,
  minutosDoHorario,
  nomeJanela,
  otimizarParadas,
  telefoneDoPedido,
  telefoneWa,
} from "@/lib/app-sol";

export const Route = createFileRoute("/app-sol")({
  head: () => ({
    meta: [
      { title: "Doces Sol — Produção e Entregas" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#E2674F" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Doces Sol" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    ],
    links: [
      { rel: "manifest", href: "/app-sol.webmanifest" },
      { rel: "apple-touch-icon", href: "/app-sol-192.png" },
      { rel: "icon", type: "image/png", href: "/app-sol-192.png" },
    ],
  }),
  component: AppSolPage,
});

// ─────────────────────────────────────────────────────────────────────────────
// Configuração
// ─────────────────────────────────────────────────────────────────────────────

const LOJA_ID = "e5ccd93f-acc8-42e1-8e2e-6483bb9539b5";
// Link de acesso: /app-sol?k=... (fica salvo no celular depois da 1ª abertura)
const APP_KEY = "sol-7k2m9q4x";
const CHAVE_ACESSO = "insano.sol.app.k";
const CHAVE_CFG = "insano.sol.app.cfg.v1";
const CHAVE_CACHE = "insano.sol.app.cache.v1";
const CHAVE_INSTALAR = "insano.sol.app.instalar";

const C = {
  bg: "#FBF3EA",
  card: "#FFFFFF",
  ink: "#3B2418",
  muted: "#8A6A58",
  coral: "#E2674F",
  coralDark: "#C94F3D",
  ring: "#EFD9C9",
  soft: "#FFF9F4",
  verde: "#1F7A4D",
  verdeBg: "#E7F7EE",
  ambar: "#9A6400",
  ambarBg: "#FFF4D6",
  ambarRing: "#F2D48A",
};

const BORDA = `1px solid ${C.ring}`;

type Cfg = { inicio: string; cidade: string };
const CFG_PADRAO: Cfg = { inicio: "", cidade: "Marechal Cândido Rondon - PR" };

function lerCfg(): Cfg {
  try {
    const raw = JSON.parse(localStorage.getItem(CHAVE_CFG) || "{}");
    return {
      inicio: typeof raw.inicio === "string" ? raw.inicio : CFG_PADRAO.inicio,
      cidade: typeof raw.cidade === "string" && raw.cidade.trim() ? raw.cidade : CFG_PADRAO.cidade,
    };
  } catch {
    return CFG_PADRAO;
  }
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function dataBonita(iso: string): string {
  try {
    const d = parseIso(iso);
    const s = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    }).format(d);
    return s.charAt(0).toUpperCase() + s.slice(1);
  } catch {
    return iso;
  }
}

const CORES_SABOR = ["#8D4A2F", "#B26A00", "#7C4F91", "#2F8F5B", "#B23A48", "#3E6FA8"];
function corDoSabor(nome: string): string {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) % 997;
  return CORES_SABOR[h % CORES_SABOR.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────────────────────

function AppSolPage() {
  const [liberado, setLiberado] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const k = new URL(location.href).searchParams.get("k");
      const salvo = localStorage.getItem(CHAVE_ACESSO);
      if (k && k === APP_KEY) {
        localStorage.setItem(CHAVE_ACESSO, k);
        setLiberado(true);
      } else {
        setLiberado(salvo === APP_KEY);
      }
    } catch {
      setLiberado(false);
    }
  }, []);

  if (liberado === null) return <TelaAbrindo />;
  if (!liberado) return <AcessoNegado />;
  return <Painel />;
}

function TelaAbrindo() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center font-sans"
      style={{ background: C.bg, color: C.ink }}
    >
      <div className="text-center">
        <p className="text-[46px] leading-none">🧁</p>
        <p className="mt-3 text-[14px] font-bold" style={{ color: C.muted }}>
          Abrindo o painel…
        </p>
      </div>
    </div>
  );
}

function AcessoNegado() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center px-6 font-sans"
      style={{ background: C.bg, color: C.ink }}
    >
      <div className="max-w-sm text-center">
        <p className="text-[54px] leading-none">🔒</p>
        <h1 className="mt-3 text-[22px] font-black">Painel da Doces Sol</h1>
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: C.muted }}>
          Este link é só para a Sol. Abra o link completo que você recebeu para liberar o painel
          neste celular.
        </p>
      </div>
    </div>
  );
}

function Painel() {
  const [aba, setAba] = useState<"assar" | "entregar">("assar");
  const [offset, setOffset] = useState(0); // 0 = hoje, 1 = amanhã
  const [hoje, setHoje] = useState(() => isoDate(new Date()));
  const [todos, setTodos] = useState<PedidoApp[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizado, setAtualizado] = useState<Date | null>(null);
  const [cfg, setCfg] = useState<Cfg>(CFG_PADRAO);
  const [cfgAberto, setCfgAberto] = useState(false);
  const [rascunho, setRascunho] = useState<Cfg>(CFG_PADRAO);
  const [geo, setGeo] = useState<Record<string, Coord | null>>({});
  const [geoBusy, setGeoBusy] = useState(false);
  const [instalar, setInstalar] = useState(false);

  const todosRef = useRef<PedidoApp[]>([]);
  const geoRef = useRef<Record<string, Coord | null>>({});
  const ultimaRef = useRef(0);

  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);
  useEffect(() => {
    geoRef.current = geo;
  }, [geo]);

  const dataSel = useMemo(() => {
    const d = parseIso(hoje);
    d.setDate(d.getDate() + offset);
    return isoDate(d);
  }, [hoje, offset]);

  const pedidos = useMemo(() => todos.filter((p) => dataDoPedido(p) === dataSel), [todos, dataSel]);

  const carregar = useCallback(async () => {
    if (!supabase) {
      setErro("Banco não configurado.");
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const desde = new Date();
      desde.setDate(desde.getDate() - 14);
      const { data, error } = await supabase
        .from("orders_history")
        .select(
          "id,client_name,payment_method,delivery_type,total_price,created_at,agendado_para,janela_horario,endereco,telefone,itens,items_summary",
        )
        .eq("loja_id", LOJA_ID)
        .gte("created_at", desde.toISOString())
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      const rows = (data || []) as PedidoApp[];
      setTodos(rows);
      setErro("");
      const agora = new Date();
      setAtualizado(agora);
      ultimaRef.current = Date.now();
      setHoje(isoDate(agora));
      try {
        localStorage.setItem(CHAVE_CACHE, JSON.stringify({ at: agora.getTime(), rows }));
      } catch {}
    } catch {
      if (!todosRef.current.length) {
        try {
          const c = JSON.parse(localStorage.getItem(CHAVE_CACHE) || "");
          if (Array.isArray(c?.rows)) {
            setTodos(c.rows);
            setAtualizado(new Date(c.at));
          }
        } catch {}
      }
      setErro("Não consegui atualizar. Confira a internet e toque em Atualizar.");
    } finally {
      setCarregando(false);
    }
  }, []);

  // Abre na hora com a última atualização salva e busca os números novos.
  useEffect(() => {
    setCfg(lerCfg());
    try {
      const c = JSON.parse(localStorage.getItem(CHAVE_CACHE) || "");
      if (Array.isArray(c?.rows)) {
        setTodos(c.rows);
        setAtualizado(new Date(c.at));
        setCarregando(false);
      }
    } catch {}
    carregar();
    try {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw-app-sol.js", { scope: "/app-sol" }).catch(() => {});
      }
    } catch {}
    try {
      const standalone =
        window.matchMedia?.("(display-mode: standalone)")?.matches ||
        (navigator as any).standalone === true;
      if (!standalone && localStorage.getItem(CHAVE_INSTALAR) !== "1") setInstalar(true);
    } catch {}
  }, [carregar]);

  // Atualiza sozinho a cada hora e quando ela volta pro app.
  useEffect(() => {
    const id = window.setInterval(() => carregar(), 60 * 60 * 1000);
    const aoVoltar = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - ultimaRef.current > 10 * 60 * 1000) carregar();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [carregar]);

  // Geocodifica as ruas das entregas (para ordenar a rota). Roda em segundo
  // plano; se falhar, a rota ainda abre com os endereços escritos.
  useEffect(() => {
    const alvos = new Set<string>();
    for (const p of pedidos) {
      if (/retir/i.test(String(p.delivery_type || ""))) continue;
      const e = enderecoDoPedido(p);
      if (e && e !== "endereço no resumo") alvos.add(e);
    }
    const inicio = cfg.inicio.trim();
    if (inicio) alvos.add(`__inicio__:${inicio}`);

    const faltando = [...alvos].filter((a) => !(a in geoRef.current));
    if (!faltando.length) {
      setGeoBusy(false);
      return;
    }

    let vivo = true;
    (async () => {
      setGeoBusy(true);
      for (const chave of faltando) {
        const end = chave.startsWith("__inicio__:") ? chave.slice(10) : chave;
        const c = await geocodificar(end, cfg.cidade);
        if (!vivo) return;
        setGeo((prev) => ({ ...prev, [chave]: c }));
        // Photon é público: espaça um pouco para não tomar bloqueio
        await new Promise((r) => setTimeout(r, 320));
      }
      if (vivo) setGeoBusy(false);
    })();
    return () => {
      vivo = false;
    };
  }, [pedidos, cfg.cidade, cfg.inicio]);

  const producao = useMemo(() => agregarProducao(pedidos), [pedidos]);

  const totais = useMemo(() => {
    const dHoje = hoje;
    const dAmanha = (() => {
      const d = parseIso(hoje);
      d.setDate(d.getDate() + 1);
      return isoDate(d);
    })();
    return {
      hoje: agregarProducao(todos.filter((p) => dataDoPedido(p) === dHoje)).total,
      amanha: agregarProducao(todos.filter((p) => dataDoPedido(p) === dAmanha)).total,
    };
  }, [todos, hoje]);

  const retiradas = useMemo(
    () => pedidos.filter((p) => /retir/i.test(String(p.delivery_type || ""))),
    [pedidos],
  );
  const semEndereco = useMemo(
    () =>
      pedidos.filter(
        (p) =>
          !/retir/i.test(String(p.delivery_type || "")) &&
          enderecoDoPedido(p) === "endereço no resumo",
      ),
    [pedidos],
  );
  const entregas = useMemo(
    () =>
      pedidos.filter(
        (p) =>
          !/retir/i.test(String(p.delivery_type || "")) &&
          enderecoDoPedido(p) !== "endereço no resumo",
      ),
    [pedidos],
  );

  const inicioCoord: Coord | null = cfg.inicio.trim()
    ? geo[`__inicio__:${cfg.inicio.trim()}`] || null
    : null;

  const grupos = useMemo(() => {
    const mapa = new Map<string, PedidoApp[]>();
    for (const p of entregas) {
      const j = janelaDoPedido(p) || "";
      if (!mapa.has(j)) mapa.set(j, []);
      mapa.get(j)!.push(p);
    }
    const ordenados = [...mapa.entries()].sort(
      (a, b) =>
        (a[0] ? minutosDoHorario(a[0]) : 24 * 60) - (b[0] ? minutosDoHorario(b[0]) : 24 * 60),
    );
    return ordenados.map(([janela, lista]) => {
      const paradas: Parada[] = lista.map((p) => {
        const end = enderecoDoPedido(p);
        const c = geo[end] || null;
        return {
          id: p.id,
          nome: p.client_name || "Cliente",
          endereco: end,
          telefone: telefoneDoPedido(p),
          itens: itensCurto(p),
          janela,
          lat: c?.lat,
          lon: c?.lon,
        };
      });
      return {
        janela,
        titulo: nomeJanela(janela),
        paradas: otimizarParadas(paradas, inicioCoord),
      };
    });
  }, [entregas, geo, inicioCoord]);

  function abrirCfg() {
    setRascunho(cfg);
    setCfgAberto(true);
  }

  function salvarCfg() {
    const nova: Cfg = {
      inicio: rascunho.inicio.trim(),
      cidade: rascunho.cidade.trim() || CFG_PADRAO.cidade,
    };
    setCfg(nova);
    try {
      localStorage.setItem(CHAVE_CFG, JSON.stringify(nova));
    } catch {}
    setCfgAberto(false);
  }

  return (
    <div
      className="min-h-dvh font-sans"
      style={{
        background: "radial-gradient(120% 60% at 50% 0%, #FFF8F0 0%, #FBF3EA 55%, #F6E8DA 100%)",
        color: C.ink,
      }}
    >
      <div
        className="mx-auto max-w-md px-4 pb-10"
        style={{
          paddingTop: "max(16px, env(safe-area-inset-top))",
          paddingBottom: "max(32px, env(safe-area-inset-bottom))",
        }}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-[10.5px] font-black uppercase tracking-[0.16em]"
              style={{ color: C.muted }}
            >
              Painel da Sol
            </p>
            <h1 className="text-[25px] font-black leading-tight">🧁 Doces Sol</h1>
            <p className="mt-0.5 text-[12.5px] font-semibold" style={{ color: C.muted }}>
              {dataBonita(dataSel)}
            </p>
          </div>
          <button
            type="button"
            onClick={abrirCfg}
            aria-label="Ajustes"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[17px]"
            style={{ border: BORDA }}
          >
            ⚙️
          </button>
        </header>

        <nav
          className="sticky top-0 z-20 -mx-4 mt-3 px-4 py-2"
          style={{ background: "rgba(251,243,234,0.94)", backdropFilter: "blur(6px)" }}
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAba("assar")}
              className="h-[54px] rounded-2xl text-[15px] font-black transition"
              style={
                aba === "assar"
                  ? {
                      background: C.coral,
                      color: "#fff",
                      border: `1px solid ${C.coral}`,
                      boxShadow: "0 6px 16px rgba(226,103,79,0.28)",
                    }
                  : { background: C.card, color: C.ink, border: BORDA }
              }
            >
              🍰 Assar
            </button>
            <button
              type="button"
              onClick={() => setAba("entregar")}
              className="h-[54px] rounded-2xl text-[15px] font-black transition"
              style={
                aba === "entregar"
                  ? {
                      background: C.coral,
                      color: "#fff",
                      border: `1px solid ${C.coral}`,
                      boxShadow: "0 6px 16px rgba(226,103,79,0.28)",
                    }
                  : { background: C.card, color: C.ink, border: BORDA }
              }
            >
              🛵 Entregar
            </button>
          </div>
        </nav>

        {instalar && (
          <div
            className="mt-2 flex items-start gap-2 rounded-2xl p-3"
            style={{ background: C.ambarBg, border: `1px solid ${C.ambarRing}` }}
          >
            <span className="text-[17px] leading-none">📲</span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-extrabold">Deixe na tela inicial</p>
              <p className="text-[11px] leading-snug" style={{ color: C.ambar }}>
                No Chrome: menu ⋮ → Adicionar à tela inicial. No iPhone: Compartilhar → Adicionar à
                Tela de Início.
              </p>
            </div>
            <button
              type="button"
              aria-label="Fechar aviso"
              onClick={() => {
                setInstalar(false);
                try {
                  localStorage.setItem(CHAVE_INSTALAR, "1");
                } catch {}
              }}
              className="px-1 text-[15px] font-black"
              style={{ color: C.ambar }}
            >
              ✕
            </button>
          </div>
        )}

        {erro && (
          <div
            className="mt-2 rounded-xl px-3 py-2 text-[11.5px] font-bold leading-snug"
            style={{ background: "#FDECEC", border: "1px solid #F3C6C6", color: "#9B2C2C" }}
          >
            ⚠️ {erro}
          </div>
        )}

        {aba === "assar" ? (
          <section className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <DiaPill
                ativo={offset === 0}
                titulo="Hoje"
                sub={`${totais.hoje} un`}
                onClick={() => setOffset(0)}
              />
              <DiaPill
                ativo={offset === 1}
                titulo="Amanhã"
                sub={`${totais.amanha} un`}
                onClick={() => setOffset(1)}
              />
            </div>

            <div
              className="rounded-3xl p-5"
              style={{
                background: `linear-gradient(135deg, ${C.coral} 0%, ${C.coralDark} 100%)`,
                color: "#fff",
                boxShadow: "0 12px 28px rgba(201,79,61,0.22)",
              }}
            >
              <p className="text-[12px] font-black uppercase tracking-[0.12em] opacity-85">
                Para assar {offset === 1 ? "amanhã" : "hoje"}
              </p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-[62px] font-black leading-none">{producao.total}</span>
                <span className="pb-[7px] text-[14px] font-extrabold">unidades</span>
              </div>
              <p className="mt-1 text-[12.5px] font-bold opacity-90">
                {producao.pedidos} {producao.pedidos === 1 ? "encomenda" : "encomendas"}
              </p>
            </div>

            {producao.sabores.length === 0 && producao.outros.length === 0 ? (
              <div className="rounded-3xl bg-white p-6 text-center" style={{ border: BORDA }}>
                <p className="text-[32px] leading-none">😴</p>
                <p className="mt-2 text-[16px] font-black">
                  Nada para assar {offset === 1 ? "amanhã" : "hoje"}
                </p>
                <p className="mt-1 text-[12.5px] leading-snug" style={{ color: C.muted }}>
                  Quando chegar encomenda, aparece aqui sozinho.
                </p>
                {offset === 0 && totais.amanha > 0 && (
                  <button
                    type="button"
                    onClick={() => setOffset(1)}
                    className="mt-3 rounded-xl px-3 py-2 text-[12px] font-black"
                    style={{
                      background: C.ambarBg,
                      color: C.ambar,
                      border: `1px solid ${C.ambarRing}`,
                    }}
                  >
                    Amanhã já tem {totais.amanha} un →
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {producao.sabores.map(([nome, qtd]) => (
                    <div
                      key={nome}
                      className="rounded-2xl bg-white p-4"
                      style={{ border: BORDA, borderTop: `4px solid ${corDoSabor(nome)}` }}
                    >
                      <p
                        className="text-[10.5px] font-black uppercase leading-tight tracking-wide"
                        style={{ color: C.muted }}
                      >
                        {nome}
                      </p>
                      <p className="mt-1 text-[38px] font-black leading-none">{qtd}</p>
                      <p className="text-[10.5px] font-bold" style={{ color: C.muted }}>
                        unidades
                      </p>
                    </div>
                  ))}
                </div>

                {producao.outros.length > 0 && (
                  <div className="rounded-2xl bg-white p-4" style={{ border: BORDA }}>
                    <p
                      className="text-[10.5px] font-black uppercase tracking-wide"
                      style={{ color: C.muted }}
                    >
                      Outros itens
                    </p>
                    <div className="mt-1 space-y-1">
                      {producao.outros.map(([nome, qtd]) => (
                        <div key={nome} className="flex items-baseline justify-between gap-2">
                          <span className="text-[14px] font-bold">{nome}</span>
                          <span className="text-[14px] font-black">
                            {qtd} <span className="text-[11px] font-bold">un</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        ) : (
          <section className="mt-3 space-y-3">
            <div className="rounded-2xl bg-white p-4" style={{ border: BORDA }}>
              <p className="text-[15px] font-black">
                {entregas.length} {entregas.length === 1 ? "entrega" : "entregas"}
                {retiradas.length > 0 &&
                  ` • ${retiradas.length} retirada${retiradas.length > 1 ? "s" : ""}`}
              </p>
              <p className="text-[12px] font-semibold" style={{ color: C.muted }}>
                {dataBonita(dataSel)}
              </p>
              {geoBusy && (
                <p className="mt-1 text-[11px] font-bold" style={{ color: C.ambar }}>
                  📍 Localizando endereços para montar a rota…
                </p>
              )}
            </div>

            {grupos.map((g) => (
              <GrupoEntregas
                key={g.janela || "sem"}
                titulo={g.titulo}
                janela={g.janela}
                paradas={g.paradas}
                cidade={cfg.cidade}
                inicio={cfg.inicio}
              />
            ))}

            {retiradas.length > 0 && (
              <div className="rounded-3xl bg-white p-3.5" style={{ border: BORDA }}>
                <h3 className="text-[16px] font-black">
                  🏪 Retirada no local <span style={{ color: C.muted }}>({retiradas.length})</span>
                </h3>
                <div className="mt-2 space-y-2">
                  {retiradas.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl p-3"
                      style={{ background: C.soft, border: BORDA }}
                    >
                      <p className="text-[14.5px] font-extrabold">{p.client_name || "Cliente"}</p>
                      <p className="text-[12px]" style={{ color: C.muted }}>
                        {itensCurto(p)}
                      </p>
                      {telefoneDoPedido(p) && (
                        <a
                          href={`https://wa.me/${telefoneWa(telefoneDoPedido(p))}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex rounded-lg px-2.5 py-2 text-[11.5px] font-black"
                          style={{
                            background: C.verdeBg,
                            color: C.verde,
                            border: "1px solid #BFE8D2",
                          }}
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {semEndereco.length > 0 && (
              <div className="rounded-3xl bg-white p-3.5" style={{ border: BORDA }}>
                <h3 className="text-[16px] font-black">
                  ⚠️ Sem endereço <span style={{ color: C.muted }}>({semEndereco.length})</span>
                </h3>
                <p className="mt-0.5 text-[11.5px]" style={{ color: C.muted }}>
                  O pedido não trouxe o endereço. Chame no WhatsApp para confirmar.
                </p>
                <div className="mt-2 space-y-2">
                  {semEndereco.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl p-3"
                      style={{ background: "#FFF6E5", border: "1px solid #F2D48A" }}
                    >
                      <p className="text-[14.5px] font-extrabold">{p.client_name || "Cliente"}</p>
                      <p className="text-[12px]" style={{ color: C.muted }}>
                        {itensCurto(p)}
                      </p>
                      {telefoneDoPedido(p) && (
                        <a
                          href={`https://wa.me/${telefoneWa(telefoneDoPedido(p))}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex rounded-lg px-2.5 py-2 text-[11.5px] font-black"
                          style={{
                            background: C.verdeBg,
                            color: C.verde,
                            border: "1px solid #BFE8D2",
                          }}
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entregas.length === 0 && retiradas.length === 0 && semEndereco.length === 0 && (
              <div className="rounded-3xl bg-white p-6 text-center" style={{ border: BORDA }}>
                <p className="text-[32px] leading-none">🛵</p>
                <p className="mt-2 text-[16px] font-black">Nenhuma entrega nesse dia</p>
                <p className="mt-1 text-[12.5px]" style={{ color: C.muted }}>
                  Quando entrar encomenda, a rota aparece aqui.
                </p>
              </div>
            )}

            {entregas.length > 0 && (
              <p className="px-2 text-center text-[10.5px] leading-snug" style={{ color: C.muted }}>
                Toque em <strong>🗺️ Rota</strong> para abrir o Google Maps já na ordem das entregas.
                A ordem é recalculada quando chega endereço novo.
              </p>
            )}
          </section>
        )}

        <footer
          className="mt-5 flex items-center justify-between gap-2 rounded-2xl bg-white/80 px-4 py-3"
          style={{ border: BORDA }}
        >
          <span className="text-[11px] font-bold" style={{ color: C.muted }}>
            {carregando
              ? "Atualizando…"
              : atualizado
                ? `Atualizado às ${hhmm(atualizado)}`
                : "Ainda não atualizou"}
          </span>
          <button
            type="button"
            onClick={() => carregar()}
            disabled={carregando}
            className="rounded-xl px-3 py-2 text-[12px] font-black disabled:opacity-60"
            style={{ background: C.card, border: BORDA, color: C.ink }}
          >
            🔄 Atualizar
          </button>
        </footer>
        <p className="mt-2 text-center text-[10.5px] font-semibold" style={{ color: C.muted }}>
          Atualiza sozinho a cada hora.
        </p>
      </div>

      {cfgAberto && (
        <AjustesSheet
          rascunho={rascunho}
          setRascunho={setRascunho}
          onFechar={() => setCfgAberto(false)}
          onSalvar={salvarCfg}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componentes
// ─────────────────────────────────────────────────────────────────────────────

function DiaPill({
  ativo,
  titulo,
  sub,
  onClick,
}: {
  ativo: boolean;
  titulo: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl px-3 py-2.5 text-left transition"
      style={
        ativo
          ? { background: C.ink, color: "#fff", border: `1px solid ${C.ink}` }
          : { background: C.card, color: C.ink, border: BORDA }
      }
    >
      <span className="block text-[14px] font-black leading-tight">{titulo}</span>
      <span
        className="block text-[10.5px] font-bold"
        style={{ color: ativo ? "rgba(255,255,255,0.72)" : C.muted }}
      >
        {sub}
      </span>
    </button>
  );
}

function GrupoEntregas({
  titulo,
  janela,
  paradas,
  cidade,
  inicio,
}: {
  titulo: string;
  janela: string;
  paradas: Parada[];
  cidade: string;
  inicio: string;
}) {
  const links = linksDaRota(paradas, cidade, inicio);
  const emoji = titulo === "Manhã" ? "🌅" : titulo === "Tarde" ? "🌇" : "⏰";

  return (
    <div className="rounded-3xl bg-white p-3.5" style={{ border: BORDA }}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[16.5px] font-black leading-tight">
            {emoji} {titulo} <span style={{ color: C.muted }}>({paradas.length})</span>
          </h3>
          {janela && (
            <p className="text-[10.5px] font-bold" style={{ color: C.muted }}>
              {janela}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          {links.map((link, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl px-2.5 py-2 text-[11.5px] font-black"
              style={{ background: C.coral, color: "#fff" }}
            >
              🗺️ {links.length > 1 ? `Rota ${i + 1}` : "Rota"}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-2.5 space-y-2">
        {paradas.map((p, i) => (
          <ParadaCard key={p.id} parada={p} numero={i + 1} cidade={cidade} />
        ))}
      </div>
    </div>
  );
}

function ParadaCard({
  parada,
  numero,
  cidade,
}: {
  parada: Parada;
  numero: number;
  cidade: string;
}) {
  return (
    <div className="flex gap-2.5 rounded-2xl p-3" style={{ background: C.soft, border: BORDA }}>
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12.5px] font-black"
        style={{ background: C.coral, color: "#fff" }}
      >
        {numero}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-extrabold leading-snug">{parada.endereco}</p>
        <p className="text-[12px] font-semibold" style={{ color: C.muted }}>
          {parada.nome}
          {parada.telefone ? ` • ${formatarTelefone(parada.telefone)}` : ""}
        </p>
        <p className="mt-0.5 text-[11.5px] leading-snug">{parada.itens}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <a
            href={linkMapa(parada.endereco, cidade)}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-2.5 py-2 text-[11.5px] font-black"
            style={{ background: C.card, border: BORDA, color: C.ink }}
          >
            🗺️ Mapa
          </a>
          {parada.telefone && (
            <a
              href={`https://wa.me/${telefoneWa(parada.telefone)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-2.5 py-2 text-[11.5px] font-black"
              style={{ background: C.verdeBg, color: C.verde, border: "1px solid #BFE8D2" }}
            >
              💬 WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function AjustesSheet({
  rascunho,
  setRascunho,
  onFechar,
  onSalvar,
}: {
  rascunho: Cfg;
  setRascunho: (c: Cfg) => void;
  onFechar: () => void;
  onSalvar: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(40,20,10,0.42)" }}
      onClick={onFechar}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5"
        style={{ paddingBottom: "max(22px, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[19px] font-black">Ajustes</h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onFechar}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-black"
            style={{ background: C.bg, color: C.muted }}
          >
            ✕
          </button>
        </div>

        <label className="mt-4 block">
          <span className="text-[12px] font-black" style={{ color: C.muted }}>
            📍 De onde você sai para entregar?
          </span>
          <input
            value={rascunho.inicio}
            onChange={(e) => setRascunho({ ...rascunho, inicio: e.target.value })}
            placeholder="Rua, número - bairro"
            className="mt-1 h-11 w-full rounded-xl px-3 text-[16px] font-semibold outline-none"
            style={{ background: C.soft, border: BORDA, color: C.ink }}
          />
          <span className="mt-1 block text-[10.5px] leading-snug" style={{ color: C.muted }}>
            Opcional. A rota começa nesse endereço. Se ficar vazio, o Google Maps começa de onde
            você estiver.
          </span>
        </label>

        <label className="mt-4 block">
          <span className="text-[12px] font-black" style={{ color: C.muted }}>
            🏙️ Cidade das entregas
          </span>
          <input
            value={rascunho.cidade}
            onChange={(e) => setRascunho({ ...rascunho, cidade: e.target.value })}
            placeholder="Cidade - PR"
            className="mt-1 h-11 w-full rounded-xl px-3 text-[16px] font-semibold outline-none"
            style={{ background: C.soft, border: BORDA, color: C.ink }}
          />
        </label>

        <button
          type="button"
          onClick={onSalvar}
          className="mt-5 h-12 w-full rounded-2xl text-[15px] font-black"
          style={{
            background: C.coral,
            color: "#fff",
            boxShadow: "0 8px 18px rgba(226,103,79,0.25)",
          }}
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
