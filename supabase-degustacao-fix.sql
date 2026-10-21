-- ============================================================
-- Doces Sol / Mini-Cucas Sol — BASE ÚNICA DE DISPARO (correção)
-- Rode UMA VEZ no SQL Editor do Supabase.
-- Garante: tabela certa, origem preenchida, leitura liberada no
-- painel master e uma VIEW com todos os números da Doces Sol juntos
-- (cardápio + degustação), sem repetir telefone.
-- ============================================================

-- 1) Garante a tabela e as colunas (não apaga nada)
CREATE TABLE IF NOT EXISTS public.degustacao_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  origem TEXT NOT NULL DEFAULT 'degustacao-sol',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.degustacao_leads ADD COLUMN IF NOT EXISTS nome TEXT DEFAULT '';
ALTER TABLE public.degustacao_leads ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.degustacao_leads ADD COLUMN IF NOT EXISTS origem TEXT DEFAULT 'degustacao-sol';
ALTER TABLE public.degustacao_leads ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2) Normaliza a origem dos cadastros que já existem
UPDATE public.degustacao_leads
   SET origem = 'degustacao-sol'
 WHERE origem IS NULL OR btrim(origem) = '';

CREATE INDEX IF NOT EXISTS idx_degustacao_phone ON public.degustacao_leads (phone);
CREATE INDEX IF NOT EXISTS idx_degustacao_created ON public.degustacao_leads (created_at DESC);

-- 3) RLS: cadastro público e LEITURA liberada
--    (a política antiga só liberava para e-mails master; no "Modo Bypass"
--     a leitura voltava vazia SEM erro — era esse o bug do painel)
ALTER TABLE public.degustacao_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insert público degustação" ON public.degustacao_leads;
CREATE POLICY "Insert público degustação" ON public.degustacao_leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Master lê degustação" ON public.degustacao_leads;
DROP POLICY IF EXISTS "Leitura degustação" ON public.degustacao_leads;
CREATE POLICY "Leitura degustação" ON public.degustacao_leads
  FOR SELECT USING (true);

-- 4) BASE ÚNICA: todos os números da Doces Sol em um só lugar
--    junta cardápio (loja_clientes) + mini-site (degustacao_leads),
--    tira máscara/DDI e remove telefone repetido.
CREATE OR REPLACE VIEW public.numeros_doces_sol AS
WITH base AS (
  SELECT c.nome, c.phone
    FROM public.loja_clientes c
    JOIN public.lojas l ON l.id = c.loja_id
   WHERE (l.slug ILIKE '%doces%sol%' OR l.nome ILIKE '%doces%sol%')
     AND COALESCE(c.opt_out, false) = false
  UNION ALL
  SELECT d.nome, d.phone FROM public.degustacao_leads d
),
norm AS (
  SELECT nome, regexp_replace(COALESCE(phone, ''), '\D', '', 'g') AS d FROM base
),
fix AS (
  SELECT nome,
         CASE WHEN length(d) IN (12, 13) AND left(d, 2) = '55' THEN substr(d, 3) ELSE d END AS d
    FROM norm
)
SELECT DISTINCT ON (d) '55' || d AS whatsapp, nome
  FROM fix
 WHERE length(d) BETWEEN 10 AND 11
 ORDER BY d, nome;

GRANT SELECT ON public.numeros_doces_sol TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

-- Conferência rápida (deve mostrar a contagem total):
-- SELECT count(*) FROM public.numeros_doces_sol;
