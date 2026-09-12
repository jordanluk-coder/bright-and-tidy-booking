-- =====================================================================
--  Bright and Tidy Cleaning — Supabase schema, security policies & helpers
-- =====================================================================
--  Run this file in the Supabase SQL editor (Dashboard → SQL → New query).
--  It is safe to re-run: every statement is idempotent.
--
--  Tables use the exact field names required by the app. Nothing is renamed.
--  Weekday convention for business_hours.weekday: 0 = Sunday … 6 = Saturday
--  (matches JavaScript's Date#getDay()).
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- ---------------------------------------------------------------------
--  Tables
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text,
  duration_minutes integer not null check (duration_minutes > 0),
  price            numeric(10,2) not null check (price >= 0),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null,
  email            text not null,
  phone            text not null,
  service_id       uuid not null references public.services(id),
  appointment_date date not null,
  start_time       time not null,
  end_time         time not null,
  status           text not null default 'pending'
                   check (status in ('pending','confirmed','cancelled','completed')),
  notes            text,
  created_at       timestamptz not null default now(),
  constraint appointments_time_order check (end_time > start_time)
);

create table if not exists public.business_hours (
  id         uuid primary key default gen_random_uuid(),
  weekday    integer not null unique check (weekday between 0 and 6),
  is_open    boolean not null default true,
  start_time time not null default '09:00',
  end_time   time not null default '17:00'
);

create table if not exists public.blocked_dates (
  id           uuid primary key default gen_random_uuid(),
  blocked_date date not null unique,
  reason       text,
  created_at   timestamptz not null default now()
);

create table if not exists public.business_settings (
  id                    uuid primary key default gen_random_uuid(),
  business_name         text not null default 'Bright and Tidy Cleaning',
  business_email        text not null default 'hello@example.com',
  business_phone        text not null default '(555) 010-2040',
  business_address      text not null default '120 Harbor Street, Suite 4, Portland, OR',
  slot_interval_minutes integer not null default 30 check (slot_interval_minutes > 0),
  booking_notice_hours  integer not null default 24 check (booking_notice_hours >= 0),
  created_at            timestamptz not null default now()
);

create table if not exists public.admin_users (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists appointments_date_idx on public.appointments (appointment_date, start_time);
create index if not exists appointments_status_idx on public.appointments (status);

-- Database-level guard against double bookings: two non-cancelled appointments
-- can never overlap in time on the same day, even under concurrent requests.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'appointments_no_overlap'
  ) then
    alter table public.appointments
      add constraint appointments_no_overlap
      exclude using gist (
        appointment_date with =,
        tsrange((appointment_date + start_time)::timestamp,
                (appointment_date + end_time)::timestamp, '[)') with &&
      )
      where (status <> 'cancelled');
  end if;
end $$;

-- ---------------------------------------------------------------------
--  Helper: is the current auth user an admin? (admin_users.user_id only)
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
--  Helper: busy windows for a day — exposes ONLY start/end times so the
--  public booking flow can avoid overlaps without any read access to
--  customer data. (No public SELECT policy exists on appointments.)
-- ---------------------------------------------------------------------
create or replace function public.get_booked_slots(target_date date)
returns table (start_time time, end_time time)
language sql
stable
security definer
set search_path = public
as $$
  select a.start_time, a.end_time
  from public.appointments a
  where a.appointment_date = target_date
    and a.status <> 'cancelled'
  order by a.start_time;
$$;

grant execute on function public.get_booked_slots(date) to anon, authenticated;

-- ---------------------------------------------------------------------
--  Server-side booking rules for public inserts
-- ---------------------------------------------------------------------
--  The website already only offers valid times, but anyone holding the
--  public anon key could call the API directly. This trigger enforces the
--  essentials in the database for non-admin inserts:
--    * the service exists and is active
--    * end_time = start_time + services.duration_minutes
--    * the date is not blocked
--    * the day is open and the window sits inside business_hours
--    * the date is not in the past
--  (Booking notice is enforced in the booking flow; the database has no
--   business time zone to measure it against.)
create or replace function public.validate_public_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  svc record;
  hrs record;
begin
  -- Admins may create or adjust appointments freely from the dashboard.
  if public.is_admin() then
    return new;
  end if;

  select s.duration_minutes, s.is_active into svc
  from public.services s where s.id = new.service_id;
  if not found or not svc.is_active then
    raise exception 'This service is not available for booking.' using errcode = 'P0001';
  end if;

  if new.end_time <> new.start_time + make_interval(mins => svc.duration_minutes) then
    raise exception 'The appointment length must match the service duration.' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.blocked_dates b where b.blocked_date = new.appointment_date) then
    raise exception 'This date is not available for booking.' using errcode = 'P0001';
  end if;

  select h.is_open, h.start_time, h.end_time into hrs
  from public.business_hours h
  where h.weekday = extract(dow from new.appointment_date)::int;
  if not found or not hrs.is_open
     or new.start_time < hrs.start_time or new.end_time > hrs.end_time then
    raise exception 'The requested time is outside business hours.' using errcode = 'P0001';
  end if;

  -- Same-day and past requests are never accepted: every job is confirmed by
  -- phone first, and the quote depends on details the office reviews up front.
  if new.appointment_date <= current_date then
    raise exception 'Bookings must be made at least a day in advance. Please choose a later date.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists appointments_validate_public on public.appointments;
create trigger appointments_validate_public
  before insert on public.appointments
  for each row execute function public.validate_public_appointment();

-- ---------------------------------------------------------------------
--  Row Level Security
-- ---------------------------------------------------------------------
alter table public.services          enable row level security;
alter table public.appointments      enable row level security;
alter table public.business_hours    enable row level security;
alter table public.blocked_dates     enable row level security;
alter table public.business_settings enable row level security;
alter table public.admin_users       enable row level security;

-- services: everyone can read; admins manage
drop policy if exists "services_public_read"  on public.services;
drop policy if exists "services_admin_all"    on public.services;
create policy "services_public_read" on public.services
  for select to anon, authenticated using (true);
create policy "services_admin_all" on public.services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- appointments: public may INSERT only (never read); admins manage everything
drop policy if exists "appointments_public_insert" on public.appointments;
drop policy if exists "appointments_admin_all"     on public.appointments;
create policy "appointments_public_insert" on public.appointments
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and end_time > start_time
    and exists (select 1 from public.services s where s.id = service_id and s.is_active)
  );
create policy "appointments_admin_all" on public.appointments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- business_hours: public read; admins manage
drop policy if exists "business_hours_public_read" on public.business_hours;
drop policy if exists "business_hours_admin_all"   on public.business_hours;
create policy "business_hours_public_read" on public.business_hours
  for select to anon, authenticated using (true);
create policy "business_hours_admin_all" on public.business_hours
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- blocked_dates: public read; admins manage
drop policy if exists "blocked_dates_public_read" on public.blocked_dates;
drop policy if exists "blocked_dates_admin_all"   on public.blocked_dates;
create policy "blocked_dates_public_read" on public.blocked_dates
  for select to anon, authenticated using (true);
create policy "blocked_dates_admin_all" on public.blocked_dates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- business_settings: public read (company name, phone, address); admins manage
drop policy if exists "business_settings_public_read" on public.business_settings;
drop policy if exists "business_settings_admin_all"   on public.business_settings;
create policy "business_settings_public_read" on public.business_settings
  for select to anon, authenticated using (true);
create policy "business_settings_admin_all" on public.business_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- admin_users: a signed-in user may read ONLY their own row (this is the admin check)
drop policy if exists "admin_users_self_read" on public.admin_users;
create policy "admin_users_self_read" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
--  Booking photos (Supabase Storage)
-- ---------------------------------------------------------------------
--  Customers can attach photos of their space to a booking request. The
--  bucket is private: visitors may upload, only admins may look.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'booking-photos', 'booking-photos', false, 10485760,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  drop policy if exists "booking_photos_public_upload" on storage.objects;
  create policy "booking_photos_public_upload" on storage.objects
    for insert to anon, authenticated
    with check (bucket_id = 'booking-photos');

  drop policy if exists "booking_photos_admin_read" on storage.objects;
  create policy "booking_photos_admin_read" on storage.objects
    for select to authenticated
    using (bucket_id = 'booking-photos' and public.is_admin());

  drop policy if exists "booking_photos_admin_delete" on storage.objects;
  create policy "booking_photos_admin_delete" on storage.objects
    for delete to authenticated
    using (bucket_id = 'booking-photos' and public.is_admin());
exception
  when insufficient_privilege then
    raise notice 'Could not create the storage policies from SQL. Add them in Dashboard → Storage → booking-photos → Policies: INSERT for anon, SELECT and DELETE for admins.';
end $$;

-- ---------------------------------------------------------------------
--  Starter data (only inserted when the tables are empty)
-- ---------------------------------------------------------------------
insert into public.business_settings (business_name, business_email, business_phone, business_address, slot_interval_minutes, booking_notice_hours)
select 'Bright and Tidy Cleaning', 'hello@brightandtidycleaning.com', '(555) 010-2040', '120 Harbor Street, Suite 4, Portland, OR 97209', 30, 24
where not exists (select 1 from public.business_settings);

insert into public.business_hours (weekday, is_open, start_time, end_time)
select v.weekday, v.is_open, v.start_time::time, v.end_time::time
from (values
  (0, false, '09:00', '17:00'),
  (1, true,  '08:00', '18:00'),
  (2, true,  '08:00', '18:00'),
  (3, true,  '08:00', '18:00'),
  (4, true,  '08:00', '18:00'),
  (5, true,  '08:00', '18:00'),
  (6, true,  '09:00', '15:00')
) as v(weekday, is_open, start_time, end_time)
where not exists (select 1 from public.business_hours);

-- Prices are the "starting at" minimums from the company pricing model. The exact
-- quote depends on size and condition and is confirmed with the customer by phone.
insert into public.services (name, description, duration_minutes, price, is_active)
select * from (values
  ('Standard Cleaning', 'Our recurring maintenance clean. Kitchens, bathrooms, bedrooms and living areas dusted, wiped, vacuumed and mopped. Weekly, every two weeks or every four weeks, with recurring visits discounted.', 120, 175.00, true),
  ('Deep Cleaning', 'A detailed top-to-bottom reset. Baseboards, inside appliances, grout, vents, light fixtures and every overlooked corner get careful attention. The right first visit for a new home or a new recurring plan.', 240, 375.00, true),
  ('Move-In / Move-Out Cleaning', 'Empty-home cleaning built for handovers. Cabinets inside and out, appliances, closets, windowsills and floors left spotless for the next chapter.', 300, 425.00, true),
  ('Post-Construction Cleaning', 'The detail clean after the trades finish and before move-in. Every surface dusted top to bottom, cabinets inside and out, fixtures polished, stickers and paint spots off the glass, floors finished.', 360, 450.00, true),
  ('Office Cleaning', 'Routine cleaning for offices, daycares, retail and salons. Trash, restrooms, touchpoints and floors, handled after hours. Priced per visit and set up as a monthly schedule.', 90, 70.00, true)
) as v(name, description, duration_minutes, price, is_active)
where not exists (select 1 from public.services);

-- ---------------------------------------------------------------------
--  Grant admin access to a Supabase Auth user
-- ---------------------------------------------------------------------
--  1. Create the user in Dashboard → Authentication → Users (email + password).
--  2. Copy the user's UUID and run:
--
--     insert into public.admin_users (user_id) values ('PASTE-AUTH-USER-UUID-HERE')
--     on conflict (user_id) do nothing;
--
--  Admin access is decided only by admin_users.user_id — never by email.
