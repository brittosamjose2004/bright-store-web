-- Add variants column to products table
alter table products 
add column if not exists variants jsonb default '[]'::jsonb;
-- structure: [{ name: "Size", options: [{ label: "Large", price_mod: 50 }] }]

-- Update RLS (if needed, usually not if purely column add)
-- existing policies usually cover all columns
