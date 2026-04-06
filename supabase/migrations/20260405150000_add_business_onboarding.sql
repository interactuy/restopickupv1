begin;

alter table public.businesses
add column if not exists onboarding_completed_at timestamptz;

commit;
