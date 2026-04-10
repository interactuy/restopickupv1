begin;

alter table public.business_applications
  add column if not exists pickup_address text,
  add column if not exists current_sales_channels text,
  add column if not exists estimated_order_volume text;

commit;
