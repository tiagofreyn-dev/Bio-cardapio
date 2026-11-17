-- Tabela para rastrear quais números já receberam disparo (anti-repetição).
-- Rodar 1x no SQL Editor do Supabase.

create table if not exists public.disparo_enviados (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  phone text not null,
  created_at timestamptz not null default now(),
  unique (loja_id, phone)
);

create index if not exists disparo_enviados_loja_idx on public.disparo_enviados(loja_id);

-- RLS: leitura/escrita apenas para usuários autenticados da própria loja
alter table public.disparo_enviados enable row level security;

drop policy if exists "disparo_enviados_select" on public.disparo_enviados;
create policy "disparo_enviados_select" on public.disparo_enviados
  for select to authenticated
  using (loja_id in (select id from public.lojas where user_id = auth.uid()));

drop policy if exists "disparo_enviados_insert" on public.disparo_enviados;
create policy "disparo_enviados_insert" on public.disparo_enviados
  for insert to authenticated
  with check (loja_id in (select id from public.lojas where user_id = auth.uid()));

drop policy if exists "disparo_enviados_delete" on public.disparo_enviados;
create policy "disparo_enviados_delete" on public.disparo_enviados
  for delete to authenticated
  using (loja_id in (select id from public.lojas where user_id = auth.uid()));
'