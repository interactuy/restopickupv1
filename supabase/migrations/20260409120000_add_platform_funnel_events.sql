begin;

create table if not exists public.platform_funnel_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  event_type text not null,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint platform_funnel_events_event_type_check
    check (
      event_type in (
        'menu_view',
        'cart_add',
        'checkout_started',
        'order_created',
        'payment_success'
      )
    )
);

create index if not exists platform_funnel_events_type_created_at_idx
  on public.platform_funnel_events (event_type, created_at desc);

create index if not exists platform_funnel_events_business_type_created_at_idx
  on public.platform_funnel_events (business_id, event_type, created_at desc);

create index if not exists platform_funnel_events_session_created_at_idx
  on public.platform_funnel_events (session_id, created_at desc);

commit;
