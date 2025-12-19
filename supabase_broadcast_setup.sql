-- Add push_token to profiles if not exists
alter table profiles 
add column if not exists push_token text;

-- Create messages table for history
create table messages (
  id uuid default gen_random_uuid() primary key,
  subject text not null,
  body text not null,
  sent_via text[] not null, -- ['email', 'push']
  recipient_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table messages enable row level security;

-- Policies for Messages
create policy "Admins can view messages." on messages
  for select using (auth.role() = 'authenticated');

create policy "Admins can insert messages." on messages
  for insert with check (auth.role() = 'authenticated');
