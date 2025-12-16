-- 1. Crear la tabla de sugerencias
create table public.sugerencias (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  nombre text not null,
  apellido text not null,
  email text not null,
  zona text not null,
  descripcion text not null
);

-- 2. Habilitar seguridad (RLS)
alter table public.sugerencias enable row level security;

-- 3. Crear políticas de acceso
-- IMPORTANTE: Para esta demo, permitimos que cualquiera inserte y cualquiera lea.
-- En producción, deberías restringir la lectura solo a administradores.

-- Permitir que cualquier usuario (incluso anónimos) cree sugerencias
create policy "Permitir insertar sugerencias" 
on public.sugerencias 
for insert 
with check (true);

-- Permitir leer sugerencias (necesario para el dashboard en esta demo sin auth compleja)
create policy "Permitir leer sugerencias" 
on public.sugerencias 
for select 
using (true);
