import type { Settings } from "./types";

// Helpers de data para encomendas/produção. Tudo em horário LOCAL (o fuso do
// celular da dona), nunca UTC — senão "amanhã" vira "hoje" depois das 21h.

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIso(iso: string): Date {
  const [y, m, d] = (iso || "").split("-").map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}

/** YYYY-MM-DD de hoje (local). */
export function hojeIso(): string {
  return isoDate(new Date());
}

/** Minutos desde a meia-noite do horário de corte ("23:00" -> 1380). */
export function corteMinutos(settings?: Settings | null): number {
  const raw = (settings?.encomendaCorte || "23:00").trim();
  const m = raw.match(/^(\d{1,2})[:h](\d{2})/);
  if (!m) return 23 * 60;
  const h = Math.min(23, Math.max(0, Number(m[1])));
  const min = Math.min(59, Math.max(0, Number(m[2])));
  return h * 60 + min;
}

/**
 * Próxima data que o cliente PODE encomendar.
 * - Antes do corte: amanhã.
 * - Depois do corte: depois de amanhã (a produção de amanhã já fechou).
 */
export function proximaDataEncomenda(settings?: Settings | null, agora = new Date()): string {
  const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const passou = agora.getHours() * 60 + agora.getMinutes() >= corteMinutos(settings);
  d.setDate(d.getDate() + (passou ? 2 : 1));
  return isoDate(d);
}

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** "22/10 (qui)" */
export function dataCurta(iso: string): string {
  const d = parseIso(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} (${DIAS[d.getDay()]})`;
}

/** "22/10/2026" */
export function dataLonga(iso: string): string {
  const d = parseIso(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export const JANELAS_PADRAO = ["08:00 às 12:00", "13:00 às 17:00"];

/** Janelas configuradas pela loja (fallback: manhã/tarde). */
export function janelasDe(settings?: Settings | null): string[] {
  const list = (settings?.encomendaJanelas || []).map((s) => String(s).trim()).filter(Boolean);
  return list.length > 0 ? list : JANELAS_PADRAO;
}
