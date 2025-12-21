-- Enable the "storage" extension if not already enabled (usually enabled by default)
-- create extension if not exists "storage";

-- 1. Create the 'products' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 2. Create the 'banners' bucket if it doesn't exist (for ads)
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

-- 3. Set up Policies for 'products' bucket
-- Allow public access to view images
create policy "Public Access Products"
on storage.objects for select
using ( bucket_id = 'products' );

-- Allow authenticated users (like admin) to upload images
create policy "Admin Upload Products"
on storage.objects for insert
with check ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- Allow authenticated users to update/delete (optional, for management)
create policy "Admin Update Products"
on storage.objects for update
using ( bucket_id = 'products' AND auth.role() = 'authenticated' );

create policy "Admin Delete Products"
on storage.objects for delete
using ( bucket_id = 'products' AND auth.role() = 'authenticated' );


-- 4. Set up Policies for 'banners' bucket
-- Allow public access to view images
create policy "Public Access Banners"
on storage.objects for select
using ( bucket_id = 'banners' );

-- Allow authenticated users to upload
create policy "Admin Upload Banners"
on storage.objects for insert
with check ( bucket_id = 'banners' AND auth.role() = 'authenticated' );

-- Allow authenticated users to delete
create policy "Admin Delete Banners"
on storage.objects for delete
using ( bucket_id = 'banners' AND auth.role() = 'authenticated' );
