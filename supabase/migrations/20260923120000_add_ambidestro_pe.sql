-- Adiciona a opção 'Ambidestro' ao pé preferencial do atleta.
ALTER TYPE public.pe_dominante ADD VALUE IF NOT EXISTS 'Ambidestro';
