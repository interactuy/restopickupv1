begin;

alter table public.businesses
  add column if not exists business_hours jsonb not null default '[]'::jsonb,
  add column if not exists is_temporarily_closed boolean not null default false;

commit;
