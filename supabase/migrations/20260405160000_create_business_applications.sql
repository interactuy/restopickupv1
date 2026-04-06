begin;

create table public.business_applications (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  instagram_or_website text,
  city text,
  business_type text,
  message text,
  review_notes text,
  reviewed_at timestamptz,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  approved_business_id uuid references public.businesses(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint business_applications_status_check
    check (status in ('pending', 'approved', 'rejected'))
);

create index business_applications_status_created_at_idx
  on public.business_applications (status, created_at desc);

create index business_applications_email_created_at_idx
  on public.business_applications (lower(email), created_at desc);

create trigger set_business_applications_updated_at
before update on public.business_applications
for each row
execute function public.set_updated_at();

commit;
