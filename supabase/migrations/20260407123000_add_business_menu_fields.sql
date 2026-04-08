begin;

alter table public.businesses
  add column if not exists description text,
  add column if not exists prep_time_min_minutes integer,
  add column if not exists prep_time_max_minutes integer;

alter table public.businesses
  drop constraint if exists businesses_prep_time_min_minutes_check;

alter table public.businesses
  add constraint businesses_prep_time_min_minutes_check
    check (
      prep_time_min_minutes is null
      or prep_time_min_minutes >= 0
    );

alter table public.businesses
  drop constraint if exists businesses_prep_time_max_minutes_check;

alter table public.businesses
  add constraint businesses_prep_time_max_minutes_check
    check (
      prep_time_max_minutes is null
      or prep_time_max_minutes >= 0
    );

alter table public.businesses
  drop constraint if exists businesses_prep_time_range_check;

alter table public.businesses
  add constraint businesses_prep_time_range_check
    check (
      prep_time_max_minutes is null
      or prep_time_min_minutes is null
      or prep_time_max_minutes >= prep_time_min_minutes
    );

commit;
