-- Enable RLS and allow public (anon) read access for menu/recipe tables

-- drink_menu
alter table if exists public.drink_menu enable row level security;
do $$ begin
  create policy "Allow public read on drink_menu"
  on public.drink_menu
  for select
  using (true);
exception when duplicate_object then null; end $$;

-- recipes
alter table if exists public.recipes enable row level security;
do $$ begin
  create policy "Allow public read on recipes"
  on public.recipes
  for select
  using (true);
exception when duplicate_object then null; end $$;

-- food_menu
alter table if exists public.food_menu enable row level security;
do $$ begin
  create policy "Allow public read on food_menu"
  on public.food_menu
  for select
  using (true);
exception when duplicate_object then null; end $$;

-- Note: Other tables remain without public policies.
-- Edge Functions and server routes use the service role key and are unaffected by RLS.


