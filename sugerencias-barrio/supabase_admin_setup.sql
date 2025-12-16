-- 1. Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  role text not null default 'viewer' check (role in ('viewer', 'admin', 'superadmin')),
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. RLS Policies
-- Allow users to read all profiles (needed for Admin Dashboard list)
-- In a stricter app, only admins should read all. For now, we allow read.
create policy "Allow read access for all authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- Allow users to update their own profile
create policy "Allow update for users on their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow Service Role (Admin API) to do anything
-- (Service role bypasses RLS by default, but good to know)

-- 4. Trigger to handle new user creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, role, email)
  values (
    new.id, 
    'viewer', -- Default role
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Re-create trigger if valid
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Backfill existing users (Run this once manually in SQL Editor if you have existing users)
insert into public.profiles (id, email, role)
select id, email, 'viewer'
from auth.users
on conflict (id) do update set email = excluded.email;

-- 6. Helper to promote a user to Super Admin
-- Replace 'tu-email@ejemplo.com' with the actual email
-- update public.profiles set role = 'superadmin' where email = 'tu-email@ejemplo.com';
