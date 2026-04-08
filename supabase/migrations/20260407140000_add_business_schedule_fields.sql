begin;

alter table public.businesses
  add column if not exists business_hours_text text,
  add column if not exists is_open_now boolean not null default true;

commit;
