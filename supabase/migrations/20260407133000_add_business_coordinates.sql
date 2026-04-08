begin;

alter table public.businesses
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table public.businesses
  drop constraint if exists businesses_latitude_check;

alter table public.businesses
  add constraint businesses_latitude_check
    check (latitude is null or (latitude >= -90 and latitude <= 90));

alter table public.businesses
  drop constraint if exists businesses_longitude_check;

alter table public.businesses
  add constraint businesses_longitude_check
    check (longitude is null or (longitude >= -180 and longitude <= 180));

commit;
