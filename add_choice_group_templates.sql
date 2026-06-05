ALTER TABLE public.lojas ADD COLUMN IF NOT EXISTS choice_group_templates JSONB DEFAULT '[]'::jsonb;
