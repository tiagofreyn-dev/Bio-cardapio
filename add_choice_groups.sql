-- Migration: Add choice_groups to produtos

-- Adicionar a nova coluna para suportar os Grupos de Escolhas
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS choice_groups JSONB DEFAULT '[]'::jsonb;

-- Opcional: Para ambientes locais / recriação, você pode atualizar a definição em supabase-setup.sql
