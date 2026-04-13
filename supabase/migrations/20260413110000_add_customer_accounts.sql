begin;

create table public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_customer_profiles_updated_at
before update on public.customer_profiles
for each row
execute function public.set_updated_at();

create table public.customer_favorite_businesses (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, business_id)
);

create index customer_favorite_businesses_user_created_at_idx
  on public.customer_favorite_businesses (user_id, created_at desc);

create table public.customer_recent_businesses (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  last_order_number bigint,
  last_purchased_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, business_id)
);

create index customer_recent_businesses_user_purchased_at_idx
  on public.customer_recent_businesses (user_id, last_purchased_at desc);

create trigger set_customer_recent_businesses_updated_at
before update on public.customer_recent_businesses
for each row
execute function public.set_updated_at();

alter table public.customer_profiles enable row level security;
alter table public.customer_favorite_businesses enable row level security;
alter table public.customer_recent_businesses enable row level security;

create policy "customer_profiles_select_own"
  on public.customer_profiles
  for select
  using (auth.uid() = user_id);

create policy "customer_profiles_insert_own"
  on public.customer_profiles
  for insert
  with check (auth.uid() = user_id);

create policy "customer_profiles_update_own"
  on public.customer_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "customer_profiles_delete_own"
  on public.customer_profiles
  for delete
  using (auth.uid() = user_id);

create policy "customer_favorite_businesses_select_own"
  on public.customer_favorite_businesses
  for select
  using (auth.uid() = user_id);

create policy "customer_favorite_businesses_insert_own"
  on public.customer_favorite_businesses
  for insert
  with check (auth.uid() = user_id);

create policy "customer_favorite_businesses_delete_own"
  on public.customer_favorite_businesses
  for delete
  using (auth.uid() = user_id);

create policy "customer_recent_businesses_select_own"
  on public.customer_recent_businesses
  for select
  using (auth.uid() = user_id);

create policy "customer_recent_businesses_insert_own"
  on public.customer_recent_businesses
  for insert
  with check (auth.uid() = user_id);

create policy "customer_recent_businesses_update_own"
  on public.customer_recent_businesses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "customer_recent_businesses_delete_own"
  on public.customer_recent_businesses
  for delete
  using (auth.uid() = user_id);

commit;
