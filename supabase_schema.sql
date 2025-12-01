-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  phone text,
  alt_phone text,
  address_line1 text,
  address_line2 text,
  landmark text,
  city text,
  pincode text
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a table for orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  total_amount numeric not null,
  status text default 'pending',
  items jsonb not null,
  shipping_address jsonb not null
);

-- Enable RLS for orders
alter table orders enable row level security;

create policy "Users can view their own orders." on orders
  for select using (auth.uid() = user_id);

create policy "Users can insert their own orders." on orders
  for insert with check (auth.uid() = user_id);
