-- ======================================================================
-- SCRIPT DE ESQUEMA SAAS MULTI-TENANT COMPLETO - BIO-CARDAPIO
-- ======================================================================
-- Este script configura toda a estrutura do banco de dados SaaS Multi-tenant,
-- incluindo a criação de todas as tabelas (lojas, produtos, faturamento, sorteios),
-- chaves estrangeiras de isolamento, e políticas de Row Level Security (RLS).
-- Execute este script no SQL Editor do seu painel do Supabase.

-- 1. APAGAR TODAS AS TABELAS E COMPONENTES EXISTENTES
DROP TABLE IF EXISTS public.campaign_winners CASCADE;
DROP TABLE IF EXISTS public.participants CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.orders_history CASCADE;
DROP TABLE IF EXISTS public.delivery_locations CASCADE;
DROP TABLE IF EXISTS public.produtos CASCADE;
DROP TABLE IF EXISTS public.pedidos CASCADE;
DROP TABLE IF EXISTS public.categorias CASCADE;
DROP TABLE IF EXISTS public.lojas CASCADE;
DROP TABLE IF EXISTS public.store_data CASCADE;

-- 2. CRIAR TABELA DE LOJAS (Perfis dos Tenants)
CREATE TABLE public.lojas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL,
    cor_tema TEXT NOT NULL,
    status_assinatura TEXT NOT NULL DEFAULT 'pendente',
    whatsapp TEXT,
    endereco TEXT,
    taxa_entrega NUMERIC(10,2) DEFAULT 0.00,
    chave_pix TEXT,
    titular_pix TEXT,
    cobranca_automatica BOOLEAN DEFAULT true NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CRIAR TABELA DE PRODUTOS
CREATE TABLE public.produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco NUMERIC(10,2) NOT NULL,
    imagem TEXT, -- Emoji ou URL
    category TEXT NOT NULL, -- Ex: 'hamburgueres', 'porcoes', 'bebidas'
    disponivel BOOLEAN DEFAULT true NOT NULL,
    customizavel BOOLEAN DEFAULT false NOT NULL,
    has_lettuce_option BOOLEAN DEFAULT true,
    has_ketchup_option BOOLEAN DEFAULT true,
    has_mayo_option BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CRIAR TABELA DE TAXAS DE ENTREGA POR REGIÃO
CREATE TABLE public.delivery_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    fee NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CRIAR TABELA DE HISTÓRICO DE PEDIDOS (Faturamento)
CREATE TABLE public.orders_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    payment_method TEXT NOT NULL, -- 'Pix', 'Cartão', 'Dinheiro'
    delivery_type TEXT NOT NULL, -- 'Entrega', 'Retirada'
    subtotal NUMERIC(10,2) NOT NULL,
    delivery_fee NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    is_fidelidade_resgate BOOLEAN DEFAULT false NOT NULL,
    items_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CRIAR TABELA DE CAMPANHAS/SORTEIOS
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    min_value NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    ends_at TIMESTAMPTZ,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CRIAR TABELA DE PARTICIPANTES DE SORTEIOS
CREATE TABLE public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    order_total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CRIAR TABELA DE GANHADORES DE SORTEIOS
CREATE TABLE public.campaign_winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_title TEXT NOT NULL,
    winner_name TEXT NOT NULL,
    winner_phone TEXT NOT NULL,
    winner_order_total NUMERIC(10,2) NOT NULL,
    drawn_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CRIAR A LOJA LEGADA INICIAL ATIVA (Insano Lanches)
INSERT INTO public.lojas (
    id, 
    nome, 
    slug, 
    tipo, 
    cor_tema, 
    status_assinatura, 
    whatsapp, 
    endereco, 
    taxa_entrega, 
    chave_pix, 
    titular_pix
)
VALUES (
    'd3b07384-d113-4ec5-a55d-e0c157855d01', 
    'Insano Lanches', 
    'insano-lanches', 
    'Hamburgueria', 
    'Vermelho', 
    'ativo',
    '5546999999999',
    'Rua Exemplo, 123 - Centro',
    5.00,
    'exemplo@pix.com',
    'Insano Lanches LTDA'
);

-- 10. HABILITAR RLS (Row Level Security) EM TODAS AS TABELAS
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_winners ENABLE ROW LEVEL SECURITY;

-- 11. CRIAR POLÍTICAS DE RLS (Segurança)

-- LOJAS
CREATE POLICY "Leitura pública de lojas" ON public.lojas FOR SELECT USING (true);
CREATE POLICY "Dono gerencia sua loja" ON public.lojas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Master admin gerencia todas as lojas" ON public.lojas FOR ALL USING (
    (auth.jwt() ->> 'email') IN ('tiagofreyn@gmail.com', 'tiagofreyn.dev@gmail.com', 'admin@biocardapio.com')
);

-- PRODUTOS
CREATE POLICY "Leitura pública de produtos" ON public.produtos FOR SELECT USING (true);
CREATE POLICY "Dono gerencia seus produtos" ON public.produtos FOR ALL USING (
    EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = produtos.loja_id AND lojas.user_id = auth.uid())
);

-- TAXAS DE ENTREGA (Globais ou editáveis por qualquer um no painel admin)
CREATE POLICY "Leitura pública de taxas" ON public.delivery_locations FOR SELECT USING (true);
CREATE POLICY "Gerenciamento de taxas" ON public.delivery_locations FOR ALL USING (true);

-- HISTÓRICO DE PEDIDOS
CREATE POLICY "Inserção pública de pedidos" ON public.orders_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Dono lê faturamento de sua loja" ON public.orders_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = orders_history.loja_id AND lojas.user_id = auth.uid())
);
CREATE POLICY "Dono deleta faturamento de sua loja" ON public.orders_history FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = orders_history.loja_id AND lojas.user_id = auth.uid())
);

-- CAMPANHAS
CREATE POLICY "Leitura pública de sorteios" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Gerenciamento de sorteios" ON public.campaigns FOR ALL USING (true);

-- PARTICIPANTES
CREATE POLICY "Inserção pública de participantes" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Leitura pública de participantes" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Gerenciamento de participantes" ON public.participants FOR ALL USING (true);

-- GANHADORES
CREATE POLICY "Leitura pública de ganhadores" ON public.campaign_winners FOR SELECT USING (true);
CREATE POLICY "Gerenciamento de ganhadores" ON public.campaign_winners FOR ALL USING (true);

-- 12. FORÇAR RECARGA IMEDIATA DO SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
