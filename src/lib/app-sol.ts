import { isoDate } from "./encomenda";

// ─────────────────────────────────────────────────────────────────────────────
// App da Sol (produção + entregas)
// Helpers puros: leem o pedido salvo em orders_history do mesmo jeito que o
// painel de Produção do admin, e calculam a rota das entregas.
// ─────────────────────────────────────────────────────────────────────────────

export type PedidoApp = {
  id: string;
  client_name: string;
  payment_method?: string;
  delivery_type: string;
  total_price?: number;
  created_at: string;
  agendado_para?: string | null;
  janela_horario?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  itens?: any;
  items_summary?: string | null;
};

export type ItemProducao = {
  name: string;
  qty: number;
  units: number;
  flavors: { name: string; qty: number }[];
};

/** Itens do pedido, com sabores. Cai no resumo quando a coluna itens está vazia. */
export function itensDoPedido(o: PedidoApp): ItemProducao[] {
  if (Array.isArray(o.itens)) {
    return o.itens.map((i: any) => ({
      name: String(i?.name || "Item"),
      qty: Number(i?.qty ?? 1) || 1,
      units: Number(i?.units ?? i?.qty ?? 1) || 1,
      flavors: Array.isArray(i?.flavors)
        ? i.flavors
            .map((f: any) => ({ name: String(f?.name || "").trim(), qty: Number(f?.qty) || 0 }))
            .filter((f: any) => f.name && f.qty > 0)
        : [],
    }));
  }
  const out: ItemProducao[] = [];
  for (const parte of String(o.items_summary || "").split(" | ")) {
    const linha = parte.split("\n")[0].trim();
    const m = linha.match(/^(\d+)x\s+(.+?)(?:\s+\((.+)\))?$/);
    if (!m) continue;
    const q = Number(m[1]) || 1;
    const nome = m[2];
    const un = Number(nome.match(/\((\d+)\s*un\)/i)?.[1] || 1) || 1;
    const flavors: { name: string; qty: number }[] = [];
    if (m[3] && /\(\d+\s*un\)/i.test(nome)) {
      for (const tok of m[3].split(",")) {
        const t = tok.trim();
        if (!t) continue;
        const mm = t.match(/^(\d+)x\s+(.+)$/);
        if (mm) flavors.push({ name: mm[2].trim(), qty: Number(mm[1]) || 1 });
        else flavors.push({ name: t, qty: 1 });
      }
    }
    out.push({ name: nome, qty: q, units: q * un, flavors });
  }
  return out;
}

/** Dia a que o pedido pertence (YYYY-MM-DD, hora local). */
export function dataDoPedido(o: PedidoApp): string | null {
  const ag = String(o.agendado_para || "").slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(ag)) return ag;
  const m = String(o.items_summary || "").match(/Encomenda:\s*(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  if (!o.created_at) return null;
  return isoDate(new Date(o.created_at));
}

export function enderecoDoPedido(o: PedidoApp): string {
  if (o.endereco && String(o.endereco).trim()) return String(o.endereco).trim();
  const m = String(o.items_summary || "").match(/Entrega:\s*(.+)/);
  return m ? m[1].trim() : "endereço no resumo";
}

export function telefoneDoPedido(o: PedidoApp): string {
  const raw = o.telefone || String(o.items_summary || "").match(/Fone:\s*([\d\s()+-]+)/)?.[1] || "";
  return String(raw).replace(/\D/g, "");
}

export function janelaDoPedido(o: PedidoApp): string {
  if (o.janela_horario) return String(o.janela_horario).trim();
  const m = String(o.items_summary || "").match(/Encomenda:.*?(\d{2}:\d{2}\s*às\s*\d{2}:\d{2})/);
  return m ? m[1] : "";
}

/** "1x Mini-cuca (5 un) (2x Chocolate, 2x Doce de Leite)" */
export function itensCurto(o: PedidoApp): string {
  return itensDoPedido(o)
    .map((it) => {
      if (it.flavors.length > 0) {
        return `${it.qty}x ${it.name} (${it.flavors.map((f) => `${f.qty}x ${f.name}`).join(", ")})`;
      }
      return `${it.qty}x ${it.name}`;
    })
    .join(" • ");
}

/** Minutos desde a meia-noite do começo da janela ("13:00 às 17:00" -> 780). */
export function minutosDoHorario(janela: string): number {
  const m = String(janela || "").match(/(\d{1,2}):(\d{2})/);
  if (!m) return 24 * 60;
  return Math.min(23, Number(m[1])) * 60 + Math.min(59, Number(m[2]));
}

export function nomeJanela(janela: string): string {
  if (!janela) return "Sem horário";
  const m = String(janela).match(/(\d{1,2}):(\d{2}).*?(\d{1,2}):(\d{2})/);
  if (!m) return minutosDoHorario(janela) < 12 * 60 ? "Manhã" : "Tarde";
  const inicio = Number(m[1]) * 60 + Number(m[2]);
  const fim = Number(m[3]) * 60 + Number(m[4]);
  if (fim <= 12 * 60) return "Manhã";
  if (inicio >= 12 * 60) return "Tarde";
  return "Do dia";
}

export type Producao = {
  sabores: [string, number][];
  outros: [string, number][];
  total: number;
  pedidos: number;
};

export function agregarProducao(pedidos: PedidoApp[]): Producao {
  const sabores = new Map<string, number>();
  const outros = new Map<string, number>();
  let total = 0;
  for (const p of pedidos) {
    for (const it of itensDoPedido(p)) {
      total += it.units;
      if (it.flavors.length) {
        for (const f of it.flavors) sabores.set(f.name, (sabores.get(f.name) || 0) + f.qty);
      } else {
        outros.set(it.name, (outros.get(it.name) || 0) + it.units);
      }
    }
  }
  const ord = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);
  return { sabores: ord(sabores), outros: ord(outros), total, pedidos: pedidos.length };
}

// ── Telefone ────────────────────────────────────────────────────────────────

export function formatarTelefone(tel: string): string {
  const d = String(tel || "").replace(/\D/g, "");
  const semPais = d.startsWith("55") && d.length > 11 ? d.slice(2) : d;
  if (semPais.length === 11)
    return `(${semPais.slice(0, 2)}) ${semPais.slice(2, 7)}-${semPais.slice(7)}`;
  if (semPais.length === 10)
    return `(${semPais.slice(0, 2)}) ${semPais.slice(2, 6)}-${semPais.slice(6)}`;
  return tel;
}

export function telefoneWa(tel: string): string {
  const d = String(tel || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("55") && d.length >= 12) return d;
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return d;
}

// ── Endereço / mapas ────────────────────────────────────────────────────────

const PREFIXO_RUA =
  /^(rua|r\.|avenida|av\.?|travessa|trav\.?|alameda|rodovia|rod\.?|estrada|est\.?|praça|praca|pca\.?)\b/i;

function limparEndereco(end: string): string {
  return String(end || "")
    .replace(/\(ref[^)]*\)/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, " - ")
    .trim();
}

function cidadeCompleta(cidade: string): string {
  const c = String(cidade || "").trim();
  if (!c) return "Brasil";
  if (/,\s*[A-Za-z]{2}\s*$/.test(c) || /\s-\s*[A-Za-z]{2}$/.test(c)) return `${c}, Brasil`;
  return `${c}, PR, Brasil`;
}

/** Endereço completo para o Google Maps (com o número, que ajuda a chegar na casa). */
export function enderecoParaMapa(endereco: string, cidade: string): string {
  let e = limparEndereco(endereco);
  if (!e || e === "endereço no resumo") return "";
  if (!PREFIXO_RUA.test(e)) e = `Rua ${e}`;
  return `${e}, ${cidadeCompleta(cidade)}`;
}

/** Consulta de geocodificação: ruas (sem número) + cidade. Photon/OSM. */
export function montarConsultaGeo(endereco: string, cidade: string): string {
  const limpo = limparEndereco(endereco);
  if (!limpo || limpo === "endereço no resumo") return "";
  const semNumero = limpo.replace(/,\s*\d+[a-zA-Z]?\b/g, "").trim();
  const ruaParte = semNumero.split(" - ")[0].replace(/,\s*$/, "").trim();
  if (!ruaParte) return "";
  const rua = PREFIXO_RUA.test(ruaParte) ? ruaParte : `Rua ${ruaParte}`;
  return `${rua}, ${cidadeCompleta(cidade)}`;
}

export type Coord = { lat: number; lon: number };

const GEO_KEY = "insano.sol.geo.v1";
type GeoCache = Record<
  string,
  { lat: number; lon: number; at: number } | { erro: true; at: number }
>;

function lerGeo(): GeoCache {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(GEO_KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function salvarGeo(c: GeoCache) {
  if (typeof window === "undefined") return;
  try {
    // cache pequeno: limita a 200 ruas
    const entradas = Object.entries(c).slice(-200);
    localStorage.setItem(GEO_KEY, JSON.stringify(Object.fromEntries(entradas)));
  } catch {}
}

const normalizar = (s: string) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function nomeCidade(cidade: string): string {
  return normalizar(
    String(cidade || "")
      .split(",")[0]
      .replace(/\s*-\s*[A-Za-z]{2}\s*$/, ""),
  );
}

/** Geocodifica a rua (OpenStreetMap via Photon). Sem chave; cache de 180 dias. */
export async function geocodificar(endereco: string, cidade: string): Promise<Coord | null> {
  const query = montarConsultaGeo(endereco, cidade);
  if (!query) return null;
  const agora = Date.now();
  const cache = lerGeo();
  const hit = cache[query];
  if (hit) {
    if ("erro" in hit) {
      if (agora - hit.at < 7 * 24 * 3600 * 1000) return null;
    } else if (agora - hit.at < 180 * 24 * 3600 * 1000) {
      return { lat: hit.lat, lon: hit.lon };
    }
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    let j: any = null;
    try {
      const r = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`,
        {
          signal: ctrl.signal,
        },
      );
      if (!r.ok) throw new Error(String(r.status));
      j = await r.json();
    } finally {
      clearTimeout(timer);
    }
    const feats: any[] = Array.isArray(j?.features) ? j.features : [];
    const alvoCidade = nomeCidade(cidade);
    const alvoRua = normalizar(query.split(",")[0].replace(PREFIXO_RUA, ""));
    const estradas = feats.filter(
      (f) => f?.properties?.osm_key === "highway" && Array.isArray(f?.geometry?.coordinates),
    );
    const daCidade = estradas.filter((f) => {
      if (!alvoCidade) return true;
      const p = f.properties || {};
      const c = normalizar(
        `${p.city || ""} ${p.town || ""} ${p.village || ""} ${p.county || ""} ${p.locality || ""}`,
      );
      return c.includes(alvoCidade);
    });
    // só aceita se o NOME da rua bater: pegar outra rua da cidade estraga a rota
    const achado = daCidade.find((f) => {
      const p = f.properties || {};
      const nome = normalizar(`${p.name || ""} ${p.street || ""}`);
      return alvoRua && nome.includes(alvoRua);
    });
    if (!achado) throw new Error("sem resultado");
    const [lon, lat] = achado.geometry.coordinates;
    cache[query] = { lat, lon, at: agora };
    salvarGeo(cache);
    return { lat, lon };
  } catch {
    cache[query] = { erro: true, at: agora };
    salvarGeo(cache);
    return null;
  }
}

// ── Rota ────────────────────────────────────────────────────────────────────

export type Parada = {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  itens: string;
  janela: string;
  lat?: number;
  lon?: number;
};

function distancia(a: Coord, b: Coord): number {
  const R = 6371;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function comprimento(seq: Parada[], inicio?: Coord | null): number {
  let total = 0;
  let anterior: Coord | null = inicio || null;
  for (const p of seq) {
    const atual: Coord = { lat: p.lat as number, lon: p.lon as number };
    if (anterior) total += distancia(anterior, atual);
    anterior = atual;
  }
  return total;
}

function melhorar2opt(seq: Parada[], inicio?: Coord | null): Parada[] {
  let melhor = seq.slice();
  let melhorDist = comprimento(melhor, inicio);
  let melhorou = true;
  let voltas = 0;
  while (melhorou && voltas < 40) {
    melhorou = false;
    voltas++;
    for (let i = 0; i < melhor.length - 1; i++) {
      for (let j = i + 1; j < melhor.length; j++) {
        const cand = melhor
          .slice(0, i)
          .concat(melhor.slice(i, j + 1).reverse())
          .concat(melhor.slice(j + 1));
        const d = comprimento(cand, inicio);
        if (d + 1e-9 < melhorDist) {
          melhor = cand;
          melhorDist = d;
          melhorou = true;
        }
      }
    }
  }
  return melhor;
}

/**
 * Ordena as paradas para a rota mais curta: vizinho mais próximo + 2-opt.
 * Se o endereço de saída for conhecido, a rota começa por ele.
 * Paradas sem localização no mapa ficam no fim, na ordem original.
 */
export function otimizarParadas(paradas: Parada[], inicio?: Coord | null): Parada[] {
  const com = paradas.filter((p) => typeof p.lat === "number" && typeof p.lon === "number");
  const sem = paradas.filter((p) => typeof p.lat !== "number" || typeof p.lon !== "number");
  if (com.length < 2) return [...com, ...sem];

  const restantes = com.slice();
  const seq: Parada[] = [];
  let atual: Coord;

  if (inicio) {
    atual = inicio;
  } else {
    // sem ponto de partida: começa pela parada mais perto do "meio" de todas
    const cx = com.reduce((s, p) => s + (p.lon as number), 0) / com.length;
    const cy = com.reduce((s, p) => s + (p.lat as number), 0) / com.length;
    const centro: Coord = { lat: cy, lon: cx };
    let melhorIdx = 0;
    let melhorD = Infinity;
    com.forEach((p, i) => {
      const d = distancia(centro, { lat: p.lat as number, lon: p.lon as number });
      if (d < melhorD) {
        melhorD = d;
        melhorIdx = i;
      }
    });
    seq.push(restantes.splice(melhorIdx, 1)[0]);
    atual = { lat: seq[0].lat as number, lon: seq[0].lon as number };
  }

  while (restantes.length) {
    let melhorIdx = 0;
    let melhorD = Infinity;
    restantes.forEach((p, i) => {
      const d = distancia(atual, { lat: p.lat as number, lon: p.lon as number });
      if (d < melhorD) {
        melhorD = d;
        melhorIdx = i;
      }
    });
    const proxima = restantes.splice(melhorIdx, 1)[0];
    seq.push(proxima);
    atual = { lat: proxima.lat as number, lon: proxima.lon as number };
  }

  return [...melhorar2opt(seq, inicio), ...sem];
}

/**
 * Link do Google Maps na ordem otimizada. O Google usa no máximo 10 paradas
 * por link (destino + 9 waypoints); se tiver mais, devolve mais de um link.
 * Usa o endereço escrito (com número) para chegar na casa certa; as
 * coordenadas serviram só para decidir a ordem.
 */
export function linksDaRota(paradas: Parada[], cidade: string, inicioTexto?: string): string[] {
  const pontos = paradas.map((p) => enderecoParaMapa(p.endereco, cidade)).filter((x) => Boolean(x));
  if (!pontos.length) return [];

  const lotes: string[][] = [];
  for (let i = 0; i < pontos.length; i += 10) lotes.push(pontos.slice(i, i + 10));

  const links: string[] = [];
  let origem = inicioTexto?.trim() ? enderecoParaMapa(inicioTexto, cidade) : "";
  for (const lote of lotes) {
    const destino = lote[lote.length - 1];
    const waypoints = lote.slice(0, -1);
    const params = new URLSearchParams({ api: "1", travelmode: "driving", destination: destino });
    if (origem) params.set("origin", origem);
    if (waypoints.length) params.set("waypoints", waypoints.join("|"));
    links.push(`https://www.google.com/maps/dir/?${params.toString()}`);
    origem = destino;
  }
  return links;
}

export function linkMapa(endereco: string, cidade: string): string {
  const q = enderecoParaMapa(endereco, cidade);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
