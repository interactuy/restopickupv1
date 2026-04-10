begin;

create table public.business_platform_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  commission_bps integer not null default 0,
  billing_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint business_platform_settings_commission_bps_check
    check (commission_bps >= 0 and commission_bps <= 10000)
);

create trigger set_business_platform_settings_updated_at
before update on public.business_platform_settings
for each row
execute function public.set_updated_at();

commit;
