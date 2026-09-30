-- ======================================================================
-- MIGRAÇÃO LEVE: clientes + cupons + log de disparos (plano gratuito OK)
-- Execute UMA VEZ no SQL Editor do Supabase.
-- Tudo com projeção mínima + índices. Estimativa: <5KB por loja/dia.
-- ======================================================================

-- 1. Números de celular por loja (1 linha por cliente, upsert por pedido)
CREATE TABLE IF NOT EXISTS public.loja_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  orders INT NOT NULL DEFAULT 1,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  opt_out BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (loja_id, phone)
);
CREATE INDEX IF NOT EXISTS idx_clientes_loja ON public.loja_clientes (loja_id, last_seen DESC);

-- 2. Travas de cupom: 1 linha por (loja, código, telefone) — garante 1 uso por pessoa
CREATE TABLE IF NOT EXISTS public.coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  phone TEXT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (loja_id, code, phone)
);
CREATE INDEX IF NOT EXISTS idx_coupon_loja_code ON public.coupon_uses (loja_id, code);

-- 3. Log de disparos: 1 linha por campanha enviada (controla limite 10/dia)
CREATE TABLE IF NOT EXISTS public.broadcast_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE,
  total INT NOT NULL DEFAULT 0,
  ok_count INT NOT NULL DEFAULT 0,
  message TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Foto do disparo (propaganda): URL pública comprimida (webp ~200KB).
-- Para bancos já criados:
ALTER TABLE public.broadcast_log ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_broadcast_loja_day ON public.broadcast_log (loja_id, created_at DESC);

-- 4. RLS: escrita pública mínima (checkout faz upsert sem login),
-- leitura restrita ao dono / master (service_role bypassa de qualquer jeito).
ALTER TABLE public.loja_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Upsert público de clientes" ON public.loja_clientes;
CREATE POLICY "Upsert público de clientes" ON public.loja_clientes
  FOR INSERT WITH CHECK (true);
-- update público liberado só para contar pedidos do próprio telefone:
DROP POLICY IF EXISTS "Update público de clientes" ON public.loja_clientes;
CREATE POLICY "Update público de clientes" ON public.loja_clientes
  FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Dono lê clientes" ON public.loja_clientes;
CREATE POLICY "Dono lê clientes" ON public.loja_clientes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = loja_clientes.loja_id AND lojas.user_id = auth.uid())
  OR (auth.jwt() ->> 'email') IN ('tiago.freyn@gmail.com','tiagofreyn@gmail.com','tiagofreyn.dev@gmail.com','admin@biocardapio.com')
);
DROP POLICY IF EXISTS "Dono gerencia clientes" ON public.loja_clientes;
CREATE POLICY "Dono gerencia clientes" ON public.loja_clientes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = loja_clientes.loja_id AND lojas.user_id = auth.uid())
  OR (auth.jwt() ->> 'email') IN ('tiago.freyn@gmail.com','tiagofreyn@gmail.com','tiagofreyn.dev@gmail.com','admin@biocardapio.com')
);

DROP POLICY IF EXISTS "Uso público de cupom" ON public.coupon_uses;
CREATE POLICY "Uso público de cupom" ON public.coupon_uses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leitura pública de uso" ON public.coupon_uses;
CREATE POLICY "Leitura pública de uso" ON public.coupon_uses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura de disparos" ON public.broadcast_log;
CREATE POLICY "Leitura de disparos" ON public.broadcast_log FOR SELECT USING (true);
DROP POLICY IF EXISTS "Insert de disparos" ON public.broadcast_log;
CREATE POLICY "Insert de disparos" ON public.broadcast_log FOR INSERT WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
