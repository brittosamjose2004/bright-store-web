-- Allow Admin to view all orders
-- Replace 'brightstore01.info@gmail.com' with the actual admin email if different, 
-- or use a specific user ID if known. 
-- For now, we will allow a specific email to bypass the "own data" check.

-- First, let's create a helper function to check if the user is an admin
-- (Optional, but cleaner. For now, we'll inline it or check email)

create or replace function is_admin()
returns boolean as $$
begin
  return auth.jwt() ->> 'email' = 'brightstore01.info@gmail.com';
end;
$$ language plpgsql security definer;

-- Update Orders Policy
drop policy if exists "Users can view their own orders." on orders;
create policy "Users can view their own orders." on orders
  for select using (
    auth.uid() = user_id or is_admin()
  );

drop policy if exists "Users can update own orders." on orders; -- If it exists
create policy "Admins can update orders." on orders
  for update using (
    is_admin()
  );

-- Update Profiles Policy (to view all customers)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true); -- This is already permissive, so it's fine.

-- Ensure Admin can Delete/Edit products (if not already set)
-- Assuming products table exists and has policies.
