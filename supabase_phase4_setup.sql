-- Create Banners table
create table if not exists public.banners (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  link text,
  active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for banners
alter table public.banners enable row level security;

-- Create policies for banners
create policy "Banners are viewable by everyone"
  on public.banners for select
  using (true);

create policy "Admins can insert banners"
  on public.banners for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can update banners"
  on public.banners for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can delete banners"
  on public.banners for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create storage bucket for banners if it doesn't exist
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

-- Storage policies for banners
create policy "Banner images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'banners' );

create policy "Admins can upload banner images"
  on storage.objects for insert
  with check (
    bucket_id = 'banners'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can delete banner images"
  on storage.objects for delete
  using (
    bucket_id = 'banners'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Ensure Offers table exists (if not already created)
create table if not exists public.offers (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  code text not null unique,
  discount_percentage integer not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for offers
alter table public.offers enable row level security;

-- Create policies for offers (if they don't exist)
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'offers' and policyname = 'Offers are viewable by everyone'
  ) then
    create policy "Offers are viewable by everyone"
      on public.offers for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'offers' and policyname = 'Admins can insert offers'
  ) then
    create policy "Admins can insert offers"
      on public.offers for insert
      with check (
        exists (
          select 1 from public.profiles
          where profiles.id = auth.uid()
          and profiles.role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'offers' and policyname = 'Admins can update offers'
  ) then
    create policy "Admins can update offers"
      on public.offers for update
      using (
        exists (
          select 1 from public.profiles
          where profiles.id = auth.uid()
          and profiles.role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'offers' and policyname = 'Admins can delete offers'
  ) then
    create policy "Admins can delete offers"
      on public.offers for delete
      using (
        exists (
          select 1 from public.profiles
          where profiles.id = auth.uid()
          and profiles.role = 'admin'
        )
      );
  end if;
end
$$;
