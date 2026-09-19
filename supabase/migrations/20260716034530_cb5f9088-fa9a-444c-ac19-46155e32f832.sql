DROP POLICY IF EXISTS "chat peer roles read" ON public.user_roles;
CREATE POLICY "chat peer roles read" ON public.user_roles FOR SELECT USING (public.users_share_conversation(auth.uid(), user_id));