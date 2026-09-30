-- ======================================================================
-- PAINEL MASTER: banners patrocinados globais (baixo consumo Supabase)
-- Execute UMA VEZ no SQL Editor do Supabase.
-- O carrossel da loja já mora no store_data JSON (zero tabelas novas).
-- Disparos usam loja_clientes + broadcast_log (do supabase-clientes-cupons.sql).
-- Evolution fica SÓ no navegador do master (localStorage) — nada no banco.
-- ======================================================================

-- 1. Patrocinados globais (1 linha por banner, lido 1x com cache 10min)
CREATE TABLE IF NOT EXISTS public.sponsor_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL DEFAULT '',
  slogan TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '📢',
  gradient TEXT NOT NULL DEFAULT 'from-zinc-700 via-zinc-800 to-zinc-900',
  active BOOLEAN NOT NULL DEFAULT true,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sponsors_active ON public.sponsor_banners (active, position);

ALTER TABLE public.sponsor_banners ENABLE ROW LEVEL SECURITY;

-- Público lê só os ativos (cardápio mostra sem login, 1 select minúsculo).
DROP POLICY IF EXISTS "Público lê patrocinados ativos" ON public.sponsor_banners;
CREATE POLICY "Público lê patrocinados ativos" ON public.sponsor_banners
  FOR SELECT USING (active = true);

-- Dono/master gerencia (service_role bypassa; painel master usa anon + RLS).
DROP POLICY IF EXISTS "Master gerencia patrocinados" ON public.sponsor_banners;
CREATE POLICY "Master gerencia patrocinados" ON public.sponsor_banners FOR ALL USING (
  (auth.jwt() ->> 'email') IN ('tiago.freyn@gmail.com','tiagofreyn@gmail.com','tiagofreyn.dev@gmail.com','admin@biocardapio.com')
);

NOTIFY pgrst, 'reload schema';
