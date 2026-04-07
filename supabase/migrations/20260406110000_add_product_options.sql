begin;

create table public.product_option_groups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  description text,
  selection_type text not null default 'single',
  is_required boolean not null default false,
  min_select integer not null default 0,
  max_select integer,
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint product_option_groups_selection_type_check
    check (selection_type in ('single', 'multiple')),
  constraint product_option_groups_min_select_check
    check (min_select >= 0),
  constraint product_option_groups_max_select_check
    check (max_select is null or max_select >= min_select)
);

create index product_option_groups_product_position_idx
  on public.product_option_groups (product_id, position, created_at);

create trigger set_product_option_groups_updated_at
before update on public.product_option_groups
for each row
execute function public.set_updated_at();

create table public.product_option_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.product_option_groups(id) on delete cascade,
  name text not null,
  price_delta_amount integer not null default 0,
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint product_option_items_price_delta_amount_check
    check (price_delta_amount >= 0)
);

create index product_option_items_group_position_idx
  on public.product_option_items (group_id, position, created_at);

create trigger set_product_option_items_updated_at
before update on public.product_option_items
for each row
execute function public.set_updated_at();

alter table public.order_items
  add column selected_options jsonb not null default '[]'::jsonb,
  add column unit_options_amount integer not null default 0,
  drop column line_total_amount,
  add column line_total_amount integer generated always as (quantity * (unit_price_amount + unit_options_amount)) stored;

alter table public.order_items
  add constraint order_items_unit_options_amount_check
    check (unit_options_amount >= 0);

commit;
