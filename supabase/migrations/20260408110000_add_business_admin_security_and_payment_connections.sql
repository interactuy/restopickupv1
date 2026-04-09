begin;

create table public.business_admin_security (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  pin_hash text,
  pin_updated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_business_admin_security_updated_at
before update on public.business_admin_security
for each row
execute function public.set_updated_at();

create table public.business_admin_pin_resets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  requested_by_user_id uuid not null,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index business_admin_pin_resets_token_hash_idx
  on public.business_admin_pin_resets (token_hash);

create index business_admin_pin_resets_business_created_at_idx
  on public.business_admin_pin_resets (business_id, created_at desc);

create table public.business_payment_connections (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  provider text not null default 'mercado_pago',
  status text not null default 'disconnected',
  mercadopago_user_id bigint,
  mercadopago_public_key text,
  access_token text,
  refresh_token text,
  live_mode boolean not null default false,
  connected_at timestamptz,
  refreshed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint business_payment_connections_provider_check
    check (provider = 'mercado_pago'),
  constraint business_payment_connections_status_check
    check (status in ('disconnected', 'connected', 'error'))
);

create trigger set_business_payment_connections_updated_at
before update on public.business_payment_connections
for each row
execute function public.set_updated_at();

commit;
