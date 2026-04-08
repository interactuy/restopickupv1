begin;

alter table public.businesses
  add column if not exists contact_action_type text not null default 'call';

alter table public.businesses
  drop constraint if exists businesses_contact_action_type_check;

alter table public.businesses
  add constraint businesses_contact_action_type_check
    check (contact_action_type in ('call', 'whatsapp'));

commit;
