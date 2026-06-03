-- ======================================================================
-- SCRIPT DE POPULAÇÃO DA CONTA DE DEMONSTRAÇÃO (REEXECUTÁVEL)
-- ======================================================================
-- Este script configura o usuário de demonstração, cria/atualiza a loja demo
-- e insere os produtos de exemplo (lanches, porções e bebidas) no banco de dados.
-- Execute este script no SQL Editor do seu painel do Supabase.

-- 1. ADICIONAR COLUNAS DE SEGURANÇA SE NÃO EXISTIREM
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS is_lancamento BOOLEAN DEFAULT false;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS adicionais JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS max_sabores INT DEFAULT 1;

-- 2. BLOCO PL/pgSQL PARA CRIAR OU VINCULAR O USUÁRIO DE TESTE AUTOMATICAMENTE
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Buscar se o usuário já existe no auth.users (caso tenha sido criado manualmente pelo Painel do Supabase)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'demo@rangoclick.com';
    
    -- Se não existir, criamos o usuário e sua identidade de login via SQL
    IF v_user_id IS NULL THEN
        v_user_id := 'd3b07384-d113-4ec5-a55d-e0c157855d99'; -- ID fixo para a demo
        
        -- Inserção na tabela auth.users
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, recovery_sent_at, last_sign_in_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
            confirmation_token, email_change, email_change_token_new, recovery_token, 
            is_super_admin, confirmed_at
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', 
            'demo@rangoclick.com', crypt('senha123', gen_salt('bf')), 
            now(), now(), now(), 
            '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(), 
            '', '', '', '', false, now()
        ) ON CONFLICT (id) DO NOTHING;
        
        -- Inserção correspondente na tabela auth.identities para habilitar o login por senha
        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        )
        VALUES (
            v_user_id, v_user_id, 
            jsonb_build_object('sub', v_user_id, 'email', 'demo@rangoclick.com'),
            'email', now(), now(), now()
        ) ON CONFLICT (provider, id) DO NOTHING;
        
        RAISE NOTICE 'Usuário demo@rangoclick.com criado com sucesso via SQL.';
    ELSE
        RAISE NOTICE 'Usuário demo@rangoclick.com já existe no banco. Associando loja ao ID: %', v_user_id;
    END IF;

    -- 3. CRIAR OU ATUALIZAR A LOJA DE DEMONSTRAÇÃO VINCULADA AO USUÁRIO
    INSERT INTO public.lojas (
        id, 
        user_id,
        nome, 
        slug, 
        tipo, 
        cor_tema, 
        status_assinatura, 
        whatsapp, 
        endereco, 
        taxa_entrega, 
        chave_pix, 
        titular_pix,
        cobranca_automatica
    )
    VALUES (
        'd3b07384-d113-4ec5-a55d-e0c157855d01', -- UUID do estabelecimento demo
        v_user_id, -- Vinculado ao ID do usuário
        'Burger Insano Demo', 
        'burger-insano-demo', 
        'Hamburgueria', 
        'Vermelho', 
        'ativo',
        '5546999999999',
        'Av. Rio Branco, 1000 - Centro',
        6.00,
        'demo@pix.com',
        'Burger Insano Demo LTDA',
        false -- Desativa cobrança automática para contornar paywall
    )
    ON CONFLICT (id) DO UPDATE SET 
        user_id = EXCLUDED.user_id,
        nome = EXCLUDED.nome,
        slug = EXCLUDED.slug,
        status_assinatura = EXCLUDED.status_assinatura,
        whatsapp = EXCLUDED.whatsapp,
        endereco = EXCLUDED.endereco,
        taxa_entrega = EXCLUDED.taxa_entrega,
        chave_pix = EXCLUDED.chave_pix,
        titular_pix = EXCLUDED.titular_pix,
        cobranca_automatica = EXCLUDED.cobranca_automatica;

END $$;

-- Limpar produtos antigos vinculados à demo para evitar duplicações
DELETE FROM public.produtos WHERE loja_id = 'd3b07384-d113-4ec5-a55d-e0c157855d01';

-- 4. INSERIR PRODUTOS DA DEMONSTRAÇÃO
-- Categoria: hamburgueres (10 lanches comuns, preço médio aprox. R$ 30)
INSERT INTO public.produtos (
    id, loja_id, nome, descricao, preco, imagem, category, disponivel, customizavel, is_featured, is_lancamento, adicionais
)
VALUES
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'X-Burguer', 'Pão brioche selado na manteiga, suculento blend bovino smash de 80g e queijo cheddar derretido.',
    22.00, '🍔', 'hamburgueres', true, true, false, false,
    '[{"nome": "Cheddar Extra", "preco": 4.50}, {"nome": "Bacon Extra", "preco": 5.00}, {"nome": "Hambúrguer Extra", "preco": 8.00}]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'X-Salada', 'Pão brioche, blend smash de 80g, queijo cheddar derretido, alface americana fresca, rodelas de tomate e maionese verde artesanal.',
    25.00, '🍔', 'hamburgueres', true, true, false, false,
    '[{"nome": "Queijo Extra", "preco": 4.50}, {"nome": "Bacon Extra", "preco": 5.00}, {"nome": "Hambúrguer Extra", "preco": 8.00}]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'X-Egg', 'Pão com gergelim, blend de 120g grelhado na chapa, queijo prato, ovo frito, alface americana, tomate e maionese.',
    27.00, '🍔', 'hamburgueres', true, true, false, false,
    '[{"nome": "Queijo Extra", "preco": 4.50}, {"nome": "Bacon Extra", "preco": 5.00}, {"nome": "Ovo Extra", "preco": 3.00}]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'Frango Gourmet', 'Pão brioche, filé de peito de frango grelhado marinado em ervas finas, queijo prato derretido, alface e maionese de alho.',
    28.00, '🍔', 'hamburgueres', true, true, false, false,
    '[{"nome": "Queijo Extra", "preco": 4.50}, {"nome": "Bacon Extra", "preco": 5.00}]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'X-Bacon', 'Pão brioche, suculento blend artesanal de 120g, queijo cheddar duplo, muitas fatias de bacon crocante e molho barbecue.',
    29.00, '🍔', 'hamburgueres', true, true, false, false,
    '[{"nome": "Cheddar Extra", "preco": 4.50}, {"nome": "Bacon Extra", "preco": 5.00}, {"nome": "Hambúrguer Extra", "preco": 8.00}]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'Burger Vegetariano', 'Pão com gergelim, hambúrguer artesanal de grão-de-bico com tempero especial, queijo prato, alface americana e maionese verde.',
    30.00, '🌱', 'hamburgueres', true, true, false, false,
    '[{"nome": "Queijo Extra", "preco": 4.50}, {"nome": "Ovo Extra", "preco": 3.00}]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'Duplo Smash Bacon', 'Para os amantes de bacon: Pão brioche, 2 blends smash de 80g super suculentos, cheddar duplo, bacon picado e maionese especial.',
    32.00, '🍔', 'hamburgueres', true, true, true, false,
    '[{"nome": "Cheddar Extra", "preco": 4.50}, {"nome": "Bacon Extra", "preco": 5.00}, {"nome": "Hambúrguer Extra", "preco": 8.00}]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'Cheddar Insano', 'Pão australiano macio, blend artesanal de 150g, cebola caramelizada na chapa e generosa cobertura de creme de cheddar.',
    34.00, '🍔', 'hamburgueres', true, true, true, false,
    '[{"nome": "Creme de Cheddar Extra", "preco": 5.50}, {"nome": "Cebola Caramelizada Extra", "preco": 4.00}]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'X-Tudo', 'O clássico completo: Pão com gergelim, blend de 120g, queijo, presunto, calabresa fatiada, bacon, ovo, alface, tomate e maionese.',
    38.00, '🍔', 'hamburgueres', true, true, false, false,
    '[{"nome": "Queijo Extra", "preco": 4.50}, {"nome": "Bacon Extra", "preco": 5.00}, {"nome": "Catupiry Original", "preco": 5.00}]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'Monstro Burger', 'Gigante da casa: Pão brioche, 3 blends smash de 80g, cheddar triplo, fatias de bacon, rodelas de cebola roxa e molho barbecue.',
    42.00, '🍔', 'hamburgueres', true, true, false, true,
    '[{"nome": "Queijo Extra", "preco": 4.50}, {"nome": "Bacon Extra", "preco": 5.00}, {"nome": "Smash Extra 80g", "preco": 6.50}]'::jsonb
);

-- Categoria: porcoes (Batatas)
INSERT INTO public.produtos (
    id, loja_id, nome, descricao, preco, imagem, category, disponivel, customizavel, is_featured, is_lancamento, adicionais
)
VALUES
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'Batata Frita Simples (Média)', 'Porção individual de batatas palito crocantes e sequinhas, levemente salgadas.',
    18.00, '🍟', 'porcoes', true, false, false, false,
    '[]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'Batata Frita Especial (Grande)', 'Porção grande de batata frita da casa coberta com muito cheddar cremoso e bacon picado crocante.',
    26.00, '🍟', 'porcoes', true, true, true, false,
    '[{"nome": "Cheddar Extra", "preco": 5.00}, {"nome": "Bacon Extra", "preco": 5.50}]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'Batata Insana com Costelinha', 'Batatas rústicas fritas com casca, cobertas com costelinha suína desfiada ao molho barbecue e cebolinha.',
    35.00, '🍟', 'porcoes', true, true, false, true,
    '[{"nome": "Sour Cream", "preco": 4.50}, {"nome": "Queijo Extra", "preco": 4.50}]'::jsonb
);

-- Categoria: bebidas (Refrigerantes e sucos)
INSERT INTO public.produtos (
    id, loja_id, nome, descricao, preco, imagem, category, disponivel, customizavel, is_featured, is_lancamento, adicionais
)
VALUES
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'Água Mineral Sem Gás 500ml', 'Garrafa de água mineral natural sem gás, super gelada.',
    4.00, '💧', 'bebidas', true, false, false, false,
    '[]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'Coca-Cola Lata 350ml', 'Lata de Coca-Cola sabor original gelada.',
    6.00, '🥤', 'bebidas', true, false, false, false,
    '[]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'Guaraná Antarctica Lata 350ml', 'Lata de Guaraná Antarctica tradicional gelado.',
    6.00, '🥤', 'bebidas', true, false, false, false,
    '[]'::jsonb
),
(
    gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01',
    'Suco Natural de Laranja 400ml', 'Copo de suco natural de laranja fresco espremido na hora.',
    9.00, '🍊', 'bebidas', true, false, false, false,
    '[]'::jsonb
);

-- 5. CRIAR REGISTROS DE EXEMPLO DE FATURAMENTO AUTOMÁTICO (Para mostrar na aba Faturamento)
DELETE FROM public.orders_history WHERE loja_id = 'd3b07384-d113-4ec5-a55d-e0c157855d01';

INSERT INTO public.orders_history (
    id, loja_id, client_name, payment_method, delivery_type, subtotal, delivery_fee, total_price, items_summary, created_at
)
VALUES
(gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01', 'Paulo Silva', 'Pix', 'Entrega', 59.00, 6.00, 65.00, '1x Duplo Smash Bacon (R$ 32), 1x Batata Frita Especial (R$ 26), 1x Coca-Cola (R$ 6)', now() - interval '2 hours'),
(gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01', 'Mariana Costa', 'Cartão', 'Retirada', 34.00, 0.00, 34.00, '1x Cheddar Insano (R$ 34)', now() - interval '4 hours'),
(gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01', 'Rodrigo Ramos', 'Dinheiro', 'Entrega', 49.00, 6.00, 55.00, '1x X-Bacon (R$ 29), 1x Batata Frita Simples (R$ 18), 1x Guaraná (R$ 6)', now() - interval '1 day'),
(gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01', 'Beatriz Souza', 'Pix', 'Entrega', 72.00, 6.00, 78.00, '1x Monstro Burger (R$ 42), 1x Batata Frita Especial (R$ 26), 1x Suco de Laranja (R$ 9)', now() - interval '1 day'),
(gen_random_uuid(), 'd3b07384-d113-4ec5-a55d-e0c157855d01', 'Eduardo Lima', 'Pix', 'Retirada', 25.00, 0.00, 25.00, '1x X-Salada (R$ 25)', now() - interval '2 days');

-- Forçar recarga imediata do PostgREST
NOTIFY pgrst, 'reload schema';
