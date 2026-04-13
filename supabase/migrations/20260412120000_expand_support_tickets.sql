begin;

create sequence if not exists public.support_ticket_number_seq;

alter table public.business_support_incidents
  alter column business_id drop not null;

alter table public.business_support_incidents
  add column if not exists ticket_number bigint,
  add column if not exists source text not null default 'internal',
  add column if not exists requester_name text,
  add column if not exists requester_email text,
  add column if not exists requester_phone text,
  add column if not exists requester_business_name text;

update public.business_support_incidents
set ticket_number = nextval('public.support_ticket_number_seq')
where ticket_number is null;

alter table public.business_support_incidents
  alter column ticket_number set default nextval('public.support_ticket_number_seq');

select setval(
  'public.support_ticket_number_seq',
  coalesce((select max(ticket_number) from public.business_support_incidents), 0) + 1,
  false
);

create unique index if not exists business_support_incidents_ticket_number_idx
  on public.business_support_incidents (ticket_number);

alter table public.business_support_incidents
  drop constraint if exists business_support_incidents_source_check;

alter table public.business_support_incidents
  add constraint business_support_incidents_source_check
    check (source in ('internal', 'commercial', 'support'));

commit;
