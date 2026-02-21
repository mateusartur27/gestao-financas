-- ============================================
-- Gestão de Finanças - Schema inicial
-- ============================================

-- Tabela de recebimentos
CREATE TABLE IF NOT EXISTS public.receivables (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT        NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  due_date    DATE        NOT NULL,
  paid        BOOLEAN     NOT NULL DEFAULT FALSE,
  paid_at     DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS receivables_user_id_idx       ON public.receivables (user_id);
CREATE INDEX IF NOT EXISTS receivables_due_date_idx      ON public.receivables (due_date);
CREATE INDEX IF NOT EXISTS receivables_paid_idx          ON public.receivables (paid);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.receivables
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem apenas seus próprios recebimentos"
  ON public.receivables FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários inserem seus próprios recebimentos"
  ON public.receivables FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam seus próprios recebimentos"
  ON public.receivables FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários deletam seus próprios recebimentos"
  ON public.receivables FOR DELETE
  USING (auth.uid() = user_id);
