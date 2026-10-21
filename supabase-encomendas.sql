-- ─────────────────────────────────────────────────────────────────────────────
-- 🗓️ ENCOMENDAS / PRODUÇÃO — Doces Sol
-- Rode UMA vez no SQL Editor do Supabase.
--
-- O que faz:
--   1. Adiciona as colunas de encomenda na tabela de pedidos (orders_history).
--   2. Cria um índice pra dona abrir o painel "Produção" rápido (1 leitura).
--
-- NÃO altera RLS nem apaga nada: as políticas atuais continuam valendo e os
-- pedidos antigos ficam com as colunas vazias (aparecem só no faturamento).
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.orders_history
  add column if not exists agendado_para date,
  add column if not exists janela_horario text,
  add column if not exists encomenda boolean default false,
  add column if not exists itens jsonb,
  add column if not exists endereco text,
  add column if not exists telefone text;

create index if not exists idx_orders_history_encomenda
  on public.orders_history (loja_id, agendado_para);

-- Conferência (opcional): mostra as colunas criadas.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'orders_history'
  and column_name in (
    'agendado_para', 'janela_horario', 'encomenda', 'itens', 'endereco', 'telefone'
  )
order by column_name;
