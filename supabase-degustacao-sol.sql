-- Captura de leads da degustação Mini-Cucas Sol (página /degustacao-sol)
-- Execute UMA VEZ no SQL Editor do Supabase.
CREATE TABLE IF NOT EXISTS public.degustacao_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  origem TEXT NOT NULL DEFAULT 'degustacao-sol',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_degustacao_created ON public.degustacao_leads (created_at DESC);

ALTER TABLE public.degustacao_leads ENABLE ROW LEVEL SECURITY;

-- Cadastro público (visitante sem login)
DROP POLICY IF EXISTS "Insert público degustação" ON public.degustacao_leads;
CREATE POLICY "Insert público degustação" ON public.degustacao_leads
  FOR INSERT WITH CHECK (true);

-- Leitura: dono (por e-mail master) — ajuste se quiser vincular por loja
DROP POLICY IF EXISTS "Master lê degustação" ON public.degustacao_leads;
CREATE POLICY "Master lê degustação" ON public.degustacao_leads FOR SELECT USING (
  (auth.jwt() ->> 'email') IN ('tiago.freyn@gmail.com','tiagofreyn@gmail.com','tiagofreyn.dev@gmail.com','admin@biocardapio.com')
);

NOTIFY pgrst, 'reload schema';
