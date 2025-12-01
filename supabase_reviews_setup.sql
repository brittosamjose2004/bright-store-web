-- Create Reviews Table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references public.products(id) not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using ( true );

create policy "Users can insert their own reviews"
  on public.reviews for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own reviews"
  on public.reviews for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own reviews"
  on public.reviews for delete
  using ( auth.uid() = user_id );
