-- Allow authenticated users to delete suggestions
-- (Ideally restrict to only admin/superadmin via another check, but for this demo using authenticated is a quick fix if RLS is enabled)
create policy "Allow delete for authenticated users" 
on public.sugerencias 
for delete 
to authenticated 
using (true);
