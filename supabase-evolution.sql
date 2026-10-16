-- ======================================================================
-- EVOLUTION API por loja: 1 instância (1 WhatsApp) por comércio
-- Execute UMA VEZ no SQL Editor do Supabase.
-- Ultra-light: 2 tabelas pequenas + índices. Sem custo extra relevante.
-- ======================================================================

-- 1. Uma instância Evolution por loja (1 número remetente por comércio)
CREATE TABLE IF NOT EXISTS public.evo_instances (
  loja_id UUID PRIMARY KEY REFERENCES public.lojas(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'desconectado',
  last_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_evo_instance_name ON public.evo_instances (instance_name);

-- 2. Fila de envio: 1 linha por (disparo, telefone) — permite 500 msgs
-- com retry, pausa e progresso sem travar o navegador.
CREATE TABLE IF NOT EXISTS public.broadcast_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID REFERENCES public.broadcast_log(id) ON DELETE CASCADE,
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  nome TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_bqueue_broadcast ON public.broadcast_queue (broadcast_id, status);
CREATE INDEX IF NOT EXISTS idx_bqueue_loja ON public.broadcast_queue (loja_id, created_at DESC);

-- 3. RLS: dono lê a própria instância/fila, master gerencia tudo.
ALTER TABLE public.evo_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dono lê evo" ON public.evo_instances;
CREATE POLICY "Dono lê evo" ON public.evo_instances FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = evo_instances.loja_id AND lojas.user_id = auth.uid())
  OR (auth.jwt() ->> 'email') IN ('tiago.freyn@gmail.com','tiagofreyn@gmail.com','tiagofreyn.dev@gmail.com','admin@biocardapio.com')
);
DROP POLICY IF EXISTS "Master gerencia evo" ON public.evo_instances;
CREATE POLICY "Master gerencia evo" ON public.evo_instances FOR ALL USING (
  (auth.jwt() ->> 'email') IN ('tiago.freyn@gmail.com','tiagofreyn@gmail.com','tiagofreyn.dev@gmail.com','admin@biocardapio.com')
) WITH CHECK (
  (auth.jwt() ->> 'email') IN ('tiago.freyn@gmail.com','tiagofreyn@gmail.com','tiagofreyn.dev@gmail.com','admin@biocardapio.com')
);

DROP POLICY IF EXISTS "Dono lê fila" ON public.broadcast_queue;
CREATE POLICY "Dono lê fila" ON public.broadcast_queue FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = broadcast_queue.loja_id AND lojas.user_id = auth.uid())
  OR (auth.jwt() ->> 'email') IN ('tiago.freyn@gmail.com','tiagofreyn@gmail.com','tiagofreyn.dev@gmail.com','admin@biocardapio.com')
);
DROP POLICY IF EXISTS "Master e dono enfileiram" ON public.broadcast_queue;
CREATE POLICY "Master e dono enfileiram" ON public.broadcast_queue FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.lojas WHERE lojas.id = broadcast_queue.loja_id AND lojas.user_id = auth.uid())
  OR (auth.jwt() ->> 'email') IN ('tiago.freyn@gmail.com','tiagofreyn@gmail.com','tiagofreyn.dev@gmail.com','admin@biocardapio.com')
);
DROP POLICY IF EXISTS "Master atualiza fila" ON public.broadcast_queue;
CREATE POLICY "Master atualiza fila" ON public.broadcast_queue FOR UPDATE USING (
  (auth.jwt() ->> 'email') IN ('tiago.freyn@gmail.com','tiagofreyn@gmail.com','tiagofreyn.dev@gmail.com','admin@biocardapio.com')
) WITH CHECK (
  (auth.jwt() ->> 'email') IN ('tiago.freyn@gmail.com','tiagofreyn@gmail.com','tiagofreyn.dev@gmail.com','admin@biocardapio.com')
);

NOTIFY pgrst, 'reload schema';
