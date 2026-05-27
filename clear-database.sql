-- ======================================================================
-- SCRIPT: LIMPEZA COMPLETA DO BANCO DE DADOS (COMEÇAR DO ZERO)
-- ======================================================================
-- Este script limpa todo o histórico de dados mock/antigos e restaura
-- apenas a estrutura básica da loja legada para começar do zero absoluto.

-- 1. Limpar todas as tabelas com CASCADE para remover relacionamentos de chaves estrangeiras
TRUNCATE TABLE public.pedidos CASCADE;
TRUNCATE TABLE public.produtos CASCADE;
TRUNCATE TABLE public.categorias CASCADE;
TRUNCATE TABLE public.lojas CASCADE;

-- 2. Criar a loja legada inicial novamente com status ativo (Insano Lanches)
-- Sem nenhum produto ou categoria herdados, permitindo que você adicione do zero
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

-- Opcional: Se desejar limpar também o histórico de faturamento global (caso use a view/tabela orders_history)
-- TRUNCATE TABLE public.orders_history CASCADE;
