-- ==========================================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS - BIO-CARDAPIO
-- Execute este script no SQL Editor do painel do seu Supabase
-- ==========================================================

-- 1. CRIAR TABELA DE LOJAS (Perfis dos Clientes)
CREATE TABLE IF NOT EXISTS public.lojas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nome_da_loja TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  cor_principal TEXT DEFAULT '#EF4444' NOT NULL,
  banner_url TEXT,
  efeito_ativo TEXT DEFAULT 'nenhum' NOT NULL, -- 'nenhum', 'queda-neve', 'confete', 'neon'
  whatsapp TEXT,
  endereco TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS (Row Level Security) na tabela lojas
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para public.lojas
-- Qualquer pessoa (inclusive visitantes não logados) pode ver os dados da loja
CREATE POLICY "Permitir leitura pública das lojas" ON public.lojas
  FOR SELECT USING (true);

-- Apenas o proprietário logado pode criar os dados da sua loja
CREATE POLICY "Permitir inserção pelo dono" ON public.lojas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Apenas o proprietário logado pode editar os dados da sua loja
CREATE POLICY "Permitir atualização pelo dono" ON public.lojas
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Apenas o proprietário logado pode deletar sua loja
CREATE POLICY "Permitir exclusão pelo dono" ON public.lojas
  FOR DELETE USING (auth.uid() = user_id);


-- 2. CRIAR TABELA DE PRODUTOS (Cardápios Individuais por Loja)
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image TEXT, -- Pode ser um Emoji (ex: "🍔") ou uma URL de imagem
  category TEXT NOT NULL, -- 'hamburgueres', 'porcoes', 'bebidas'
  available BOOLEAN DEFAULT true NOT NULL,
  customizable BOOLEAN DEFAULT false NOT NULL,
  has_lettuce_option BOOLEAN DEFAULT true,
  has_ketchup_option BOOLEAN DEFAULT true,
  has_mayo_option BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS na tabela produtos
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para public.produtos
-- Qualquer pessoa pode listar os produtos da loja
CREATE POLICY "Permitir leitura pública dos produtos" ON public.produtos
  FOR SELECT USING (true);

-- Apenas o dono da loja proprietária pode inserir produtos
CREATE POLICY "Permitir inserção de produtos pelo dono" ON public.produtos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lojas 
      WHERE lojas.id = produtos.loja_id AND lojas.user_id = auth.uid()
    )
  );

-- Apenas o dono da loja proprietária pode editar produtos
CREATE POLICY "Permitir atualização de produtos pelo dono" ON public.produtos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.lojas 
      WHERE lojas.id = produtos.loja_id AND lojas.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lojas 
      WHERE lojas.id = produtos.loja_id AND lojas.user_id = auth.uid()
    )
  );

-- Apenas o dono da loja proprietária pode excluir produtos
CREATE POLICY "Permitir exclusão de produtos pelo dono" ON public.produtos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.lojas 
      WHERE lojas.id = produtos.loja_id AND lojas.user_id = auth.uid()
    )
  );


-- 3. FUNÇÃO AUTOMÁTICA DE CRIAÇÃO DO SLUG
-- Gera automaticamente um slug legível a partir do nome da loja caso não seja fornecido
CREATE OR REPLACE FUNCTION public.gerar_loja_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  novo_slug TEXT;
  contador INT := 1;
BEGIN
  -- Converter nome para minúsculas, remover acentos e caracteres especiais
  base_slug := lower(regexp_replace(unaccent(NEW.nome_da_loja), '[^a-zA-Z0-9\s]', '', 'g'));
  -- Substituir espaços por hífen
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  
  novo_slug := base_slug;
  
  -- Verificar se já existe um slug repetido e adicionar contador se necessário
  WHILE EXISTS (SELECT 1 FROM public.lojas WHERE slug = novo_slug AND id <> NEW.id) LOOP
    novo_slug := base_slug || '-' || contador;
    contador := contador + 1;
  END LOOP;
  
  NEW.slug := novo_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar a função antes do INSERT/UPDATE na tabela lojas
DROP TRIGGER IF EXISTS trg_gerar_loja_slug ON public.lojas;
CREATE TRIGGER trg_gerar_loja_slug
  BEFORE INSERT OR UPDATE OF nome_da_loja ON public.lojas
  FOR EACH ROW
  EXECUTE FUNCTION public.gerar_loja_slug();

-- Habilitar a extensão "unaccent" caso não esteja ativada (usada para tirar acentos no slug)
CREATE EXTENSION IF NOT EXISTS unaccent;
