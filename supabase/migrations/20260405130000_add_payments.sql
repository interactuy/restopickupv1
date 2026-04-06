begin;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  provider text not null default 'mercado_pago',
  external_reference text not null,
  preference_id text,
  payment_id bigint,
  merchant_order_id bigint,
  status text not null default 'pending',
  status_detail text,
  checkout_url text,
  currency_code char(3) not null,
  amount integer not null default 0,
  raw_preference jsonb not null default '{}'::jsonb,
  raw_payment jsonb,
  notification_payload jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint payments_provider_check
    check (provider = 'mercado_pago'),
  constraint payments_amount_check
    check (amount >= 0),
  constraint payments_currency_code_check
    check (currency_code = upper(currency_code))
);

create unique index payments_external_reference_unique_idx
  on public.payments (external_reference);

create unique index payments_preference_id_unique_idx
  on public.payments (preference_id)
  where preference_id is not null;

create unique index payments_payment_id_unique_idx
  on public.payments (payment_id)
  where payment_id is not null;

create unique index payments_merchant_order_id_unique_idx
  on public.payments (merchant_order_id)
  where merchant_order_id is not null;

create index payments_order_id_idx
  on public.payments (order_id);

create index payments_business_status_idx
  on public.payments (business_id, status, created_at desc);

create trigger set_payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

commit;
