-- 1. Restrict Read Access to Sugerencias
-- Drop the old overly permissive policy if it exists (check name from supabase_setup.sql)
drop policy if exists "Permitir leer sugerencias" on public.sugerencias;

-- Create new policy: Only authenticated users can read
create policy "Solo admins pueden ver sugerencias"
on public.sugerencias
for select
to authenticated
using (true);

-- (Optional) If we strictly want to check for 'admin' role in profiles:
-- create policy "Solo admins pueden ver sugerencias"
-- on public.sugerencias
-- for select
-- to authenticated
-- using ( exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'superadmin')) );

-- 2. Ensure Insert is still public (anon)
-- The existing "Permitir insertar sugerencias" policy allows true, which includes anon. That is correct.
