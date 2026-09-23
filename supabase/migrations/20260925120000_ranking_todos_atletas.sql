-- Ranking: antes só apareciam atletas com habilidades preenchidas
-- (WHERE score IS NOT NULL) — na prática, 1 atleta. Agora TODOS os atletas
-- aparecem:
--   1) score das habilidades (validadas > autodeclaradas), escala 0–100;
--   2) senão, a nota geral da última avaliação (0–5) convertida para 0–100;
--   3) senão, sem pontuação (fim da lista).
-- A coluna `fonte` diz de onde veio o score. O tipo de retorno mudou, então a
-- função precisa ser recriada.
DROP FUNCTION IF EXISTS public.get_athlete_leaderboard(text, text, text, integer);

CREATE FUNCTION public.get_athlete_leaderboard(
  _posicao text DEFAULT NULL,
  _cidade text DEFAULT NULL,
  _skill text DEFAULT NULL,
  _limit integer DEFAULT 50
)
RETURNS TABLE(
  rank integer,
  id uuid,
  nome text,
  avatar_url text,
  posicao text,
  cidade text,
  score numeric,
  is_validated boolean,
  fonte text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _lim int := LEAST(GREATEST(COALESCE(_limit, 50), 1), 1000);
  _keys text[] := ARRAY['marcacao','forca','passe','velocidade','posicionamento'];
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT
      p.id, p.nome, p.avatar_url, p.posicao::text AS posicao, p.cidade,
      COALESCE(NULLIF(p.skills_validated, '{}'::jsonb), p.skills, '{}'::jsonb) AS eff,
      (p.skills_validated IS NOT NULL AND p.skills_validated <> '{}'::jsonb) AS is_validated
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = 'atleta'::app_role
    WHERE (_posicao IS NULL OR p.posicao::text = _posicao)
      AND (_cidade IS NULL OR p.cidade ILIKE '%' || _cidade || '%')
  ),
  ultima_nota AS (
    -- Última avaliação com nota do atleta: direta (atleta_user_id) ou via candidato.
    SELECT DISTINCT ON (alvo) alvo AS user_id, a.nota_geral
    FROM (
      SELECT COALESCE(a.atleta_user_id, c.user_id) AS alvo, a.nota_geral, a.created_at
      FROM public.avaliacoes a
      LEFT JOIN public.candidatos c ON c.id = a.candidato_id
      WHERE a.nota_geral IS NOT NULL
    ) a
    WHERE alvo IS NOT NULL
    ORDER BY alvo, a.created_at DESC
  ),
  scored AS (
    SELECT b.*,
      CASE
        WHEN _skill IS NOT NULL THEN NULLIF(b.eff ->> _skill, '')::numeric
        ELSE (
          SELECT AVG(NULLIF(b.eff ->> k, '')::numeric)
          FROM unnest(_keys) k
          WHERE NULLIF(b.eff ->> k, '') IS NOT NULL
        )
      END AS skill_score,
      -- Com filtro por habilidade específica, a nota geral não substitui a skill.
      CASE WHEN _skill IS NULL THEN LEAST(un.nota_geral * 20, 100) END AS aval_score
    FROM base b
    LEFT JOIN ultima_nota un ON un.user_id = b.id
  ),
  final AS (
    SELECT s.*,
      COALESCE(s.skill_score, s.aval_score) AS final_score,
      CASE
        WHEN s.skill_score IS NOT NULL THEN 'habilidades'
        WHEN s.aval_score IS NOT NULL THEN 'avaliacao'
        ELSE NULL
      END AS final_fonte
    FROM scored s
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY f.final_score DESC NULLS LAST, f.is_validated DESC, f.nome)::int AS rank,
    f.id, f.nome, f.avatar_url, f.posicao, f.cidade,
    ROUND(f.final_score, 1) AS score,
    f.is_validated,
    f.final_fonte AS fonte
  FROM final f
  ORDER BY f.final_score DESC NULLS LAST, f.is_validated DESC, f.nome
  LIMIT _lim;
END $$;

-- O ranking agora lista todos os atletas (inclusive menores): só usuários logados.
REVOKE EXECUTE ON FUNCTION public.get_athlete_leaderboard(text, text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_athlete_leaderboard(text, text, text, integer) TO authenticated;
