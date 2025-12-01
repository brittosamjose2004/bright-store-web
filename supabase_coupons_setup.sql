-- Add role column to profiles if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'role') then
        alter table public.profiles add column role text default 'customer';
    end if;
end $$;

-- Create Coupons Table
create table if not exists public.coupons (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount_percentage integer not null check (discount_percentage > 0 and discount_percentage <= 100),
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.coupons enable row level security;

-- Policies
drop policy if exists "Coupons are viewable by everyone" on public.coupons;
create policy "Coupons are viewable by everyone"
  on public.coupons for select
  using ( true );

drop policy if exists "Only admins can insert coupons" on public.coupons;
create policy "Only admins can insert coupons"
  on public.coupons for insert
  with check ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Only admins can update coupons" on public.coupons;
create policy "Only admins can update coupons"
  on public.coupons for update
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Only admins can delete coupons" on public.coupons;
create policy "Only admins can delete coupons"
  on public.coupons for delete
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
