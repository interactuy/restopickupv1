begin;

alter table public.orders
  add column if not exists customer_user_id uuid references auth.users(id) on delete set null;

create index if not exists orders_customer_user_status_idx
  on public.orders (customer_user_id, payment_status, status_code, placed_at desc);

commit;
