-- Create a table for advertisements
create table ads (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  link text,
  active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table ads enable row level security;

-- Policies
create policy "Ads are viewable by everyone." on ads
  for select using (true);

create policy "Admins can insert ads." on ads
  for insert with check (auth.role() = 'authenticated'); -- Ideally restricted to admin email or role

create policy "Admins can update ads." on ads
  for update using (auth.role() = 'authenticated');

create policy "Admins can delete ads." on ads
  for delete using (auth.role() = 'authenticated');

-- Storage Bucket Policy (Execute in SQL Editor if 'ads' bucket doesn't exist)
insert into storage.buckets (id, name, public) 
values ('ads', 'ads', true)
on conflict (id) do nothing;

create policy "Ad Images are publicly accessible." on storage.objects
  for select using ( bucket_id = 'ads' );

create policy "Admins can upload ad images." on storage.objects
  for insert with check ( bucket_id = 'ads' and auth.role() = 'authenticated' );
