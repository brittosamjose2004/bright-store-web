-- Create the orders table if it doesn't exist
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  total_amount numeric not null,
  status text default 'pending',
  items jsonb not null,
  shipping_address jsonb not null
);

-- Enable RLS
alter table orders enable row level security;

-- Helper function to check for admin (replace email if needed)
create or replace function is_admin()
returns boolean as $$
begin
  return auth.jwt() ->> 'email' = 'brightstore01.info@gmail.com';
end;
$$ language plpgsql security definer;

-- Policy: Users can view their own orders OR Admins can view all
drop policy if exists "Users can view their own orders." on orders;
create policy "Users can view their own orders." on orders
  for select using (
    auth.uid() = user_id or is_admin()
  );

-- Policy: Users can insert their own orders
drop policy if exists "Users can insert their own orders." on orders;
create policy "Users can insert their own orders." on orders
  for insert with check (auth.uid() = user_id);

-- Policy: Admins can update orders (e.g. change status)
drop policy if exists "Admins can update orders." on orders;
create policy "Admins can update orders." on orders
  for update using (
    is_admin()
  );
