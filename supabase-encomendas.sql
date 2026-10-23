-- ─────────────────────────────────────────────────────────────────────────────
-- 🗓️ ENCOMENDAS / PRODUÇÃO — Doces Sol
-- Rode este arquivo no SQL Editor do Supabase (pode rodar mais de uma vez).
--
-- O que faz:
--   1. Adiciona as colunas de encomenda na tabela de pedidos (orders_history).
--   2. Cria um índice pra dona abrir o painel "Produção" rápido (1 leitura).
--   3. LIBERA a gravação/leitura de pedidos pelo cardápio público (RLS).
--      Sem isso NENHUM pedido era salvo (faturamento e painel ficavam vazios).
--
-- Não apaga nada: pedidos antigos ficam com as colunas de encomenda vazias.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Colunas de encomenda ------------------------------------------------------
alter table public.orders_history
  add column if not exists agendado_para date,
  add column if not exists janela_horario text,
  add column if not exists encomenda boolean default false,
  add column if not exists itens jsonb,
  add column if not exists endereco text,
  add column if not exists telefone text;

-- 2) Índice do painel ----------------------------------------------------------
create index if not exists idx_orders_history_encomenda
  on public.orders_history (loja_id, agendado_para);

-- 3) RLS: deixa o cardápio público GRAVAR o pedido e o painel LER --------------
alter table public.orders_history enable row level security;

-- Insere pedido (visitante do cardápio, sem login).
drop policy if exists "pedidos_insert_publico" on public.orders_history;
create policy "pedidos_insert_publico" on public.orders_history
  for insert
  to anon, authenticated
  with check (true);

-- Lê pedidos (painel de produção / faturamento).
drop policy if exists "pedidos_select_publico" on public.orders_history;
create policy "pedidos_select_publico" on public.orders_history
  for select
  to anon, authenticated
  using (true);

-- Conferência: colunas + políticas criadas
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'orders_history'
  and column_name in (
    'agendado_para', 'janela_horario', 'encomenda', 'itens', 'endereco', 'telefone'
  )
order by column_name;

select policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'orders_history'
order by policyname;
