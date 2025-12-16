-- 1. Create a new public bucket for suggestion images
insert into storage.buckets (id, name, public)
values ('sugerencias-images', 'sugerencias-images', true)
on conflict (id) do nothing;

-- 2. Add image_url column to sugerencias table
alter table public.sugerencias 
add column if not exists image_url text;

-- 3. Storage Policies

-- Allow public read access to the bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'sugerencias-images' );

-- Allow anyone to upload images (since suggestions are open)
create policy "Allow Uploads"
on storage.objects for insert
with check ( bucket_id = 'sugerencias-images' );
