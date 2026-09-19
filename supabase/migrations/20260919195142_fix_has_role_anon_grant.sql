-- A revogação em 20260507200843 removeu EXECUTE em has_role() do papel anon,
-- mas várias políticas RLS de leitura pública (ex.: "peneiras read" em
-- public.peneiras) usam `visibilidade = 'publica' OR public.has_role(...)`.
-- O Postgres exige permissão de EXECUTE em toda função referenciada numa
-- política RLS mesmo que o ramo não seja necessário para aquela linha —
-- então visitantes anônimos recebiam "permission denied for function
-- has_role" em qualquer leitura, mascarado como lista vazia pelo app
-- (o erro é engolido e vira `[]` em fetchPeneirasFromDb).
DO $$ BEGIN
  GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;
EXCEPTION WHEN insufficient_privilege THEN NULL; END $$;
