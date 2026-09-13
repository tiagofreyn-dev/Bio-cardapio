-- ======================================================================
-- ULTRA-LIGHT: índices + limites para 50 lanchonetes sem estourar Supabase
-- Execute UMA VEZ no SQL Editor do Supabase (projeto de produção).
-- O que faz: acelera filtros eq() usados pelo app e evita full-scan.
-- Sem isso, orders_history/participants crescem e cada select vira MBs.
-- ======================================================================

-- 1. Índices (IF NOT EXISTS = seguro rodar 2x)
CREATE INDEX IF NOT EXISTS idx_lojas_slug ON public.lojas (slug);
CREATE INDEX IF NOT EXISTS idx_lojas_user_id ON public.lojas (user_id);
CREATE INDEX IF NOT EXISTS idx_store_data_loja_id ON public.store_data (loja_id);
CREATE INDEX IF NOT EXISTS idx_orders_loja_created ON public.orders_history (loja_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_campaign ON public.participants (campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_loja ON public.participants (loja_id, created_at DESC);

-- 2. Trava anti-duplicata de polling: o app agora usa .limit(200),
-- mas se alguma loja passar de 50k pedidos, rode a limpeza abaixo
-- (apaga duplicatas exatas mantendo a mais recente por loja+nome+total):
-- DELETE FROM public.orders_history a USING public.orders_history b
-- WHERE a.id < b.id
--   AND a.loja_id = b.loja_id
--   AND a.client_name = b.client_name
--   AND a.total_price = b.total_price
--   AND a.created_at = b.created_at;

-- 3. Storage: liste órfãos do bucket products-images (logos trocadas
-- nunca eram deletadas). Rode no Storage > products-images e apague
-- arquivos sem URL referenciada em store_data. O app agora rejeita
-- upload >5MB e comprime para webp ~0.8MB.

-- 4. Webhook: defina o segredo no servidor (Vercel/Cloudflare env):
-- CAKTO_WEBHOOK_SECRET=<token aleatório longo>
-- e configure a mesma string no painel da Cakto (header x-webhook-secret).
-- Sem isso, o endpoint aceita qualquer POST (modo legado) — com o
-- segredo definido, POST sem segredo = 401 sem tocar no banco.

-- 5. Limites do plano (referência Free 2026):
-- Egress 500MB/mês, 50k requests/mês, 500MB banco, 1GB storage.
-- Com o modo ultra-light aplicado no código:
--  - cardápio público: 2 reads com projeção + cache 5min (~5-15KB cada)
--  - admin: sync com debounce 2s (N teclas = 1 upsert), faturamento
--    com limite 200 + polling 120s + pausa em aba oculta
--  - master: 100 lojas por página com colunas mínimas
--  - checkout: 1-2 inserts com truncate 2KB + rate-limit 15s
-- Estimativa 50 lojas ativas: <2GB egress + <80k req/mês.
-- Se passar disso, o próximo passo é Edge Cache (Cloudflare) na
-- rota /cardapio/$slug, não mais query direta.
