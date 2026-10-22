-- MVP concierge: o clube SOLICITA o desbloqueio de contato e a equipe de suporte
-- aprova ou recusa. Nenhuma cobrança automática; a liberação é manual.
-- Toda escrita acontece no servidor (service_role); o cliente só lê.

CREATE TABLE IF NOT EXISTS public.solicitacoes_desbloqueio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clube_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- candidatos.id OU o user_id do atleta (mesma regra de contatos_desbloqueados)
  candidato_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','liberado','recusado')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolvido_em TIMESTAMPTZ,
  resolvido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  observacao TEXT
);

-- No máximo uma solicitação pendente por clube e atleta.
CREATE UNIQUE INDEX IF NOT EXISTS uq_solicitacoes_desbloqueio_pendente
  ON public.solicitacoes_desbloqueio (clube_id, candidato_id)
  WHERE status = 'pendente';
CREATE INDEX IF NOT EXISTS idx_solicitacoes_desbloqueio_clube
  ON public.solicitacoes_desbloqueio (clube_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_desbloqueio_status
  ON public.solicitacoes_desbloqueio (status, criado_em DESC);

ALTER TABLE public.solicitacoes_desbloqueio ENABLE ROW LEVEL SECURITY;

REVOKE INSERT, UPDATE, DELETE ON public.solicitacoes_desbloqueio FROM authenticated, anon;
REVOKE ALL ON public.solicitacoes_desbloqueio FROM anon;
GRANT SELECT ON public.solicitacoes_desbloqueio TO authenticated;
GRANT ALL ON public.solicitacoes_desbloqueio TO service_role;

DROP POLICY IF EXISTS "clube le proprias solicitacoes" ON public.solicitacoes_desbloqueio;
CREATE POLICY "clube le proprias solicitacoes"
  ON public.solicitacoes_desbloqueio FOR SELECT TO authenticated
  USING (auth.uid() = clube_id);

DROP POLICY IF EXISTS "suporte le todas solicitacoes" ON public.solicitacoes_desbloqueio;
CREATE POLICY "suporte le todas solicitacoes"
  ON public.solicitacoes_desbloqueio FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'suporte'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
