begin;

alter table public.business_applications
add column if not exists related_user_id uuid references auth.users(id) on delete set null,
add column if not exists processed_at timestamptz,
add column if not exists access_email_sent_at timestamptz;

commit;
