ALTER TABLE public.candidatos ADD COLUMN IF NOT EXISTS data_nascimento date;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'candidatos' AND column_name = 'idade'
  ) THEN
    UPDATE public.candidatos SET data_nascimento = (current_date - (idade || ' years')::interval)::date WHERE data_nascimento IS NULL AND idade IS NOT NULL;
    ALTER TABLE public.candidatos ALTER COLUMN data_nascimento SET NOT NULL;
    ALTER TABLE public.candidatos DROP COLUMN idade;
  END IF;
END $$;
