DROP POLICY IF EXISTS "clube create own peneiras" ON public.peneiras;
CREATE POLICY "clube create own peneiras"
ON public.peneiras
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'clube'::app_role) AND auth.uid() = created_by);

DROP POLICY IF EXISTS "clube manage own peneiras" ON public.peneiras;
CREATE POLICY "clube manage own peneiras"
ON public.peneiras
FOR UPDATE
USING (public.has_role(auth.uid(), 'clube'::app_role) AND auth.uid() = created_by)
WITH CHECK (public.has_role(auth.uid(), 'clube'::app_role) AND auth.uid() = created_by);

DROP POLICY IF EXISTS "clube delete own peneiras" ON public.peneiras;
CREATE POLICY "clube delete own peneiras"
ON public.peneiras
FOR DELETE
USING (public.has_role(auth.uid(), 'clube'::app_role) AND auth.uid() = created_by);