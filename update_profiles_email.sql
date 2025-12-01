-- Add email column to profiles if it doesn't exist
alter table profiles 
add column if not exists email text;

-- Update the handle_new_user function to include email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Backfill email for existing users (optional, but good practice)
update profiles p
set email = u.email
from auth.users u
where p.id = u.id
and p.email is null;
