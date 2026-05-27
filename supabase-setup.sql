-- ======================================================================
-- 1. BANCO DE DADOS: ESQUEMA SAAS MULTI-TENANT
-- ======================================================================

-- Criar tabela de lojas (Tenants)
CREATE TABLE IF NOT EXISTS public.lojas (
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
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Modificar tabelas existentes para incluir colunas de multi-tenancy se não existirem
ALTER TABLE public.categorias ADD COLUMN IF NOT EXISTS loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE;

-- Criar registro da Hamburgueria Antiga (Legada) com ID fixo
INSERT INTO public.lojas (id, nome, slug, tipo, cor_tema, status_assinatura)
VALUES ('d3b07384-d113-4ec5-a55d-e0c157855d01', 'Insano Lanches', 'insano-lanches', 'Hamburgueria', 'Vermelho', 'ativo')
ON CONFLICT (id) DO NOTHING;

-- Migrar dados legados órfãos para a loja antiga
UPDATE public.categorias SET loja_id = 'd3b07384-d113-4ec5-a55d-e0c157855d01' WHERE loja_id IS NULL;
UPDATE public.produtos SET loja_id = 'd3b07384-d113-4ec5-a55d-e0c157855d01' WHERE loja_id IS NULL;
UPDATE public.pedidos SET loja_id = 'd3b07384-d113-4ec5-a55d-e0c157855d01' WHERE loja_id IS NULL;

-- Habilitar RLS (Row Level Security) em tudo
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para acesso público (Leitura)
DROP POLICY IF EXISTS "Leitura pública de lojas" ON public.lojas;
CREATE POLICY "Leitura pública de lojas" ON public.lojas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública de categorias" ON public.categorias;
CREATE POLICY "Leitura pública de categorias" ON public.categorias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública de produtos" ON public.produtos;
CREATE POLICY "Leitura pública de produtos" ON public.produtos FOR SELECT USING (true);

-- Políticas de RLS para Donos das Lojas (Escrita/Modificação)
DROP POLICY IF EXISTS "Dono gerencia sua loja" ON public.lojas;
CREATE POLICY "Dono gerencia sua loja" ON public.lojas FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Dono gerencia suas categorias" ON public.categorias;
CREATE POLICY "Dono gerencia suas categorias" ON public.categorias FOR ALL USING (
    EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = categorias.loja_id AND lojas.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Dono gerencia seus produtos" ON public.produtos;
CREATE POLICY "Dono gerencia seus produtos" ON public.produtos FOR ALL USING (
    EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = produtos.loja_id AND lojas.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Dono gerencia seus pedidos" ON public.pedidos;
CREATE POLICY "Dono gerencia seus pedidos" ON public.pedidos FOR ALL USING (
    EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = pedidos.loja_id AND lojas.user_id = auth.uid())
);
