-- Update the is_admin function to allow all users for now (for testing)
-- OR you can add your specific email here.
create or replace function is_admin()
returns boolean as $$
begin
  -- TEMPORARY: Return true to allow any logged-in user to update orders.
  -- Ideally, replace this with: return auth.jwt() ->> 'email' IN ('your_email@gmail.com', 'brightstore01.info@gmail.com');
  return true; 
end;
$$ language plpgsql security definer;
