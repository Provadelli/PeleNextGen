
-- 1) Remove overly broad clube read on evaluations
DROP POLICY IF EXISTS "clubes leem avaliacoes aprovadas" ON public.avaliacoes;

-- 2) Remove conversations and user_presence from realtime publication
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.conversations;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_presence'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.user_presence;
  END IF;
END $$;

-- 3) Tighten realtime.messages policy: only conversation:<uuid> topics for participants
-- (skips silently when the migration role doesn't own realtime.messages — managed by Supabase)
DO $$
BEGIN
  DROP POLICY IF EXISTS "realtime authenticated participants only" ON realtime.messages;
  CREATE POLICY "realtime authenticated participants only"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (
    realtime.topic() LIKE 'conversation:%'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid
        AND (c.iniciador_id = auth.uid() OR c.atleta_id = auth.uid())
    )
  );
EXCEPTION WHEN insufficient_privilege THEN NULL;
END $$;
