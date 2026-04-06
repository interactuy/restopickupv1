begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.assign_business_order_number()
returns trigger
language plpgsql
as $$
declare
  next_number bigint;
begin
  if new.order_number is not null then
    return new;
  end if;

  insert into public.business_order_counters as boc (business_id, last_order_number)
  values (new.business_id, 1)
  on conflict (business_id)
  do update
    set last_order_number = boc.last_order_number + 1,
        updated_at = timezone('utc', now())
  returning last_order_number into next_number;

  new.order_number = next_number;
  return new;
end;
$$;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  legal_name text,
  contact_email text,
  contact_phone text,
  pickup_address text not null,
  pickup_instructions text,
  timezone text not null default 'America/Montevideo',
  currency_code char(3) not null default 'UYU',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint businesses_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint businesses_currency_code_check
    check (currency_code = upper(currency_code))
);

create unique index businesses_slug_unique_idx
  on public.businesses (lower(slug));

create table public.business_users (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (business_id, user_id),
  constraint business_users_role_check
    check (role in ('owner', 'admin', 'staff'))
);

create index business_users_user_id_idx
  on public.business_users (user_id);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint product_categories_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index product_categories_business_slug_unique_idx
  on public.product_categories (business_id, lower(slug));

create index product_categories_business_position_idx
  on public.product_categories (business_id, position, created_at);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.product_categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  price_amount integer not null,
  compare_at_amount integer,
  currency_code char(3) not null default 'UYU',
  is_available boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint products_price_amount_check
    check (price_amount >= 0),
  constraint products_compare_at_amount_check
    check (compare_at_amount is null or compare_at_amount >= price_amount),
  constraint products_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_currency_code_check
    check (currency_code = upper(currency_code))
);

create unique index products_business_slug_unique_idx
  on public.products (business_id, lower(slug));

create index products_business_category_idx
  on public.products (business_id, category_id);

create index products_business_available_position_idx
  on public.products (business_id, is_available, position, created_at);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text,
  alt_text text,
  position integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index product_images_product_position_idx
  on public.product_images (product_id, position, created_at);

create unique index product_images_primary_unique_idx
  on public.product_images (product_id)
  where is_primary;

create table public.order_statuses (
  code text primary key,
  label text not null,
  position integer not null unique,
  is_terminal boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.order_statuses (code, label, position, is_terminal)
values
  ('pending', 'Pendiente', 1, false),
  ('confirmed', 'Confirmado', 2, false),
  ('preparing', 'En preparacion', 3, false),
  ('ready_for_pickup', 'Listo para retirar', 4, false),
  ('completed', 'Retirado', 5, true),
  ('canceled', 'Cancelado', 6, true);

create table public.business_order_counters (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  last_order_number bigint not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint business_order_counters_last_order_number_check
    check (last_order_number >= 0)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  order_number bigint,
  status_code text not null default 'pending' references public.order_statuses(code),
  fulfillment_type text not null default 'pickup',
  customer_name text not null,
  customer_phone text,
  customer_notes text,
  pickup_notes text,
  requested_pickup_at timestamptz,
  estimated_ready_at timestamptz,
  ready_for_pickup_at timestamptz,
  picked_up_at timestamptz,
  canceled_at timestamptz,
  currency_code char(3) not null default 'UYU',
  subtotal_amount integer not null default 0,
  discount_amount integer not null default 0,
  total_amount integer not null default 0,
  payment_status text not null default 'pending',
  payment_provider text,
  payment_reference text,
  metadata jsonb not null default '{}'::jsonb,
  placed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint orders_order_number_positive_check
    check (order_number is null or order_number > 0),
  constraint orders_fulfillment_type_check
    check (fulfillment_type = 'pickup'),
  constraint orders_subtotal_amount_check
    check (subtotal_amount >= 0),
  constraint orders_discount_amount_check
    check (discount_amount >= 0),
  constraint orders_total_amount_check
    check (total_amount >= 0),
  constraint orders_currency_code_check
    check (currency_code = upper(currency_code)),
  constraint orders_payment_status_check
    check (payment_status in ('pending', 'authorized', 'paid', 'failed', 'refunded', 'canceled'))
);

create unique index orders_business_order_number_unique_idx
  on public.orders (business_id, order_number)
  where order_number is not null;

create index orders_business_status_placed_at_idx
  on public.orders (business_id, status_code, placed_at desc);

create index orders_business_created_at_idx
  on public.orders (business_id, created_at desc);

create index orders_payment_reference_idx
  on public.orders (payment_provider, payment_reference)
  where payment_reference is not null;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_description text,
  quantity integer not null,
  unit_price_amount integer not null,
  line_total_amount integer generated always as (quantity * unit_price_amount) stored,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint order_items_quantity_check
    check (quantity > 0),
  constraint order_items_unit_price_amount_check
    check (unit_price_amount >= 0)
);

create index order_items_order_id_idx
  on public.order_items (order_id);

create index order_items_product_id_idx
  on public.order_items (product_id);

create trigger set_businesses_updated_at
before update on public.businesses
for each row
execute function public.set_updated_at();

create trigger set_product_categories_updated_at
before update on public.product_categories
for each row
execute function public.set_updated_at();

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create trigger set_product_images_updated_at
before update on public.product_images
for each row
execute function public.set_updated_at();

create trigger set_business_order_counters_updated_at
before update on public.business_order_counters
for each row
execute function public.set_updated_at();

create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create trigger assign_orders_business_order_number
before insert on public.orders
for each row
execute function public.assign_business_order_number();

commit;
