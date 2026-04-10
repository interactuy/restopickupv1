begin;

alter table public.business_platform_settings
  add column if not exists platform_status text not null default 'active',
  add column if not exists fiscal_name text,
  add column if not exists fiscal_tax_id text,
  add column if not exists fiscal_address text,
  add column if not exists commercial_owner text,
  add column if not exists acquisition_source text;

alter table public.business_platform_settings
  drop constraint if exists business_platform_settings_platform_status_check;

alter table public.business_platform_settings
  add constraint business_platform_settings_platform_status_check
    check (platform_status in ('active', 'paused', 'blocked'));

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_platform_settings_updated_at
before update on public.platform_settings
for each row
execute function public.set_updated_at();

create table if not exists public.business_support_incidents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  status text not null default 'open',
  severity text not null default 'normal',
  notes text,
  created_by_user_id uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint business_support_incidents_status_check
    check (status in ('open', 'in_progress', 'resolved')),
  constraint business_support_incidents_severity_check
    check (severity in ('low', 'normal', 'high'))
);

create index if not exists business_support_incidents_business_status_idx
  on public.business_support_incidents (business_id, status, created_at desc);

create trigger set_business_support_incidents_updated_at
before update on public.business_support_incidents
for each row
execute function public.set_updated_at();

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs (created_at desc);

create index if not exists admin_audit_logs_entity_idx
  on public.admin_audit_logs (entity_type, entity_id, created_at desc);

insert into public.platform_settings (key, value)
values
  ('commercial_defaults', '{"default_commission_bps": 0}'::jsonb),
  ('feature_flags', '{}'::jsonb),
  ('global_texts', '{}'::jsonb)
on conflict (key) do nothing;

commit;
