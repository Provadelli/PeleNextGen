-- Aba do clube: TODOS os atletas já avaliados pelo olheiro, com a decisão da
-- última avaliação. Substitui (no front) list_atletas_aprovados, que só trazia
-- quem tinha a última decisão = 'aprovado' e perdia:
--   * avaliações antigas com decisao NULL (antes da decisão automática);
--   * avaliações feitas por peneira (atleta_user_id NULL, só candidato_id);
--   * reprovados / "reavaliar".
-- A função antiga continua existindo por compatibilidade.
CREATE OR REPLACE FUNCTION public.list_atletas_avaliados()
RETURNS TABLE(
  candidato_id uuid,
  user_id uuid,
  nome text,
  posicao text,
  cidade text,
  data_nascimento date,
  avatar_url text,
  nota_geral numeric,
  peneira_titulo text,
  decisao text,
  avaliado_em timestamptz,
  ids_desbloqueio uuid[]
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'clube'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'suporte'::app_role)
  ) THEN
    RAISE EXCEPTION 'Acesso restrito a clubes, admin ou suporte';
  END IF;

  RETURN QUERY
  WITH aval AS (
    -- Última avaliação por atleta, venha ela da avaliação direta
    -- (atleta_user_id) ou de uma peneira (candidato_id → candidatos.user_id).
    -- Candidato sem conta (user_id NULL) é identificado pelo próprio candidato.
    SELECT DISTINCT ON (x.alvo) x.*
    FROM (
      SELECT
        COALESCE(a.atleta_user_id, c.user_id, a.candidato_id) AS alvo,
        COALESCE(a.atleta_user_id, c.user_id) AS uid,
        a.candidato_id AS cand_id,
        a.decisao AS dec,
        c.status::text AS cand_status,
        a.nota_geral::numeric AS nota,
        COALESCE(a.peneira_id, c.peneira_id) AS pen_id,
        a.created_at AS quando
      FROM public.avaliacoes a
      LEFT JOIN public.candidatos c ON c.id = a.candidato_id
    ) x
    WHERE x.alvo IS NOT NULL
    ORDER BY x.alvo, x.quando DESC
  ),
  cand_sem_aval AS (
    -- Dados antigos: candidato marcado como avaliado/aprovado/reprovado sem
    -- linha em avaliacoes. Um por atleta (o mais recente).
    SELECT DISTINCT ON (COALESCE(c.user_id, c.id))
      COALESCE(c.user_id, c.id) AS alvo,
      c.user_id AS uid,
      c.id AS cand_id,
      NULL::text AS dec,
      c.status::text AS cand_status,
      c.nota_geral::numeric AS nota,
      c.peneira_id AS pen_id,
      c.updated_at AS quando
    FROM public.candidatos c
    WHERE c.status IN ('avaliado'::status_candidato, 'aprovado'::status_candidato, 'reprovado'::status_candidato)
      AND NOT EXISTS (SELECT 1 FROM aval av WHERE av.alvo = COALESCE(c.user_id, c.id))
    ORDER BY COALESCE(c.user_id, c.id), c.updated_at DESC
  ),
  todos AS (
    SELECT * FROM aval
    UNION ALL
    SELECT * FROM cand_sem_aval
  )
  SELECT
    -- Id usado no desbloqueio: o candidato quando veio de peneira, senão o atleta.
    COALESCE(t.cand_id, t.uid) AS candidato_id,
    t.uid AS user_id,
    COALESCE(p.nome, c.nome, 'Atleta')::text AS nome,
    COALESCE(p.posicao::text, c.posicao::text, 'Meia') AS posicao,
    COALESCE(p.cidade, c.cidade, '—')::text AS cidade,
    COALESCE(p.data_nascimento, c.data_nascimento, DATE '2000-01-01') AS data_nascimento,
    COALESCE(p.avatar_url, c.avatar)::text AS avatar_url,
    t.nota AS nota_geral,
    pn.titulo::text AS peneira_titulo,
    -- Decisão efetiva: a registrada; senão o status do candidato; senão a
    -- mesma regra da decisão automática do olheiro (nota >= 3.5 aprova).
    CASE
      WHEN t.dec IS NOT NULL THEN t.dec
      WHEN t.cand_status IN ('aprovado', 'reprovado') THEN t.cand_status
      WHEN t.nota IS NOT NULL AND t.nota >= 3.5 THEN 'aprovado'
      WHEN t.nota IS NOT NULL THEN 'reprovado'
      ELSE 'avaliado'
    END AS decisao,
    t.quando AS avaliado_em,
    -- Todos os ids pelos quais um contato deste atleta pode ter sido liberado.
    ARRAY(
      SELECT DISTINCT i FROM (
        SELECT t.uid AS i
        UNION ALL SELECT t.cand_id
        UNION ALL SELECT c2.id FROM public.candidatos c2 WHERE t.uid IS NOT NULL AND c2.user_id = t.uid
      ) ids
      WHERE i IS NOT NULL
    ) AS ids_desbloqueio
  FROM todos t
  LEFT JOIN public.profiles p ON p.id = t.uid
  LEFT JOIN public.candidatos c ON c.id = t.cand_id
  LEFT JOIN public.peneiras pn ON pn.id = t.pen_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_atletas_avaliados() TO authenticated;
