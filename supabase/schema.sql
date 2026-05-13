create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text unique,
  phone text,
  gender text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  plan text default 'monthly',
  start_date date,
  end_date date,
  status text check (status in ('active', 'expired', 'cancelled')),
  paystack_subscription_code text,
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon_url text,
  display_order int
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.service_categories (id) on delete set null,
  name text not null,
  description text,
  standard_price numeric,
  member_price numeric,
  home_service_standard_price numeric,
  home_service_member_price numeric,
  duration_mins int,
  has_home_service boolean default true,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  addon_photobooth boolean default false,
  service_type text check (service_type in ('walk-in', 'home')),
  address text,
  date date,
  time_slot text,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  price_paid numeric,
  is_member_price boolean,
  paystack_reference text,
  notes text,
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  paystack_reference text unique,
  amount numeric,
  payment_type text check (payment_type in ('appointment', 'membership', 'fashion_order', 'advert')),
  status text check (status in ('success', 'failed', 'pending')),
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  paystack_reference text unique not null,
  amount numeric not null,
  payment_type text check (payment_type in ('appointment', 'membership', 'fashion_order', 'advert')),
  status text check (status in ('initialized', 'preview', 'verified', 'failed')),
  is_member_applied boolean default false,
  payload jsonb,
  verified_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists public.fashion_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text check (category in ('rtw-female', 'rtw-male', 'bags', 'footwear', 'accessories', 'eyewear')),
  description text,
  standard_price numeric,
  member_price numeric,
  image_urls text[] default '{}',
  stock_quantity int default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists public.fashion_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  items jsonb,
  total_amount numeric,
  delivery_address text,
  delivery_status text check (delivery_status in ('pending', 'processing', 'dispatched', 'delivered')),
  paystack_reference text,
  notes text,
  created_at timestamp with time zone default timezone('utc', now())
);

create unique index if not exists appointments_paystack_reference_idx
  on public.appointments (paystack_reference)
  where paystack_reference is not null;

create unique index if not exists fashion_orders_paystack_reference_idx
  on public.fashion_orders (paystack_reference)
  where paystack_reference is not null;

alter table public.payments drop constraint if exists payments_payment_type_check;
alter table public.payments add constraint payments_payment_type_check
  check (payment_type in ('appointment', 'membership', 'fashion_order', 'advert'));

alter table public.payment_intents drop constraint if exists payment_intents_payment_type_check;
alter table public.payment_intents add constraint payment_intents_payment_type_check
  check (payment_type in ('appointment', 'membership', 'fashion_order', 'advert'));

create table if not exists public.tailoring_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  gender text,
  outfit_type text,
  description text,
  standard_price numeric,
  member_price numeric,
  appointment_date date,
  appointment_time text,
  status text check (status in ('pending', 'confirmed', 'in-progress', 'ready', 'delivered')),
  paystack_reference text,
  created_at timestamp with time zone default timezone('utc', now())
);

create unique index if not exists tailoring_orders_paystack_reference_idx
  on public.tailoring_orders (paystack_reference)
  where paystack_reference is not null;

create table if not exists public.training_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  programme_name text,
  registration_date timestamp with time zone default timezone('utc', now()),
  status text default 'registered' check (status in ('registered', 'confirmed', 'attended'))
);

create unique index if not exists training_registrations_user_programme_idx
  on public.training_registrations (user_id, programme_name);

create table if not exists public.advert_submissions (
  id uuid primary key default gen_random_uuid(),
  business_name text,
  contact_name text,
  email text,
  phone text,
  advert_description text,
  preferred_duration text,
  creative_url text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists public.giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  month text,
  entry_date timestamp with time zone default timezone('utc', now())
);

create unique index if not exists giveaway_entries_user_month_idx
  on public.giveaway_entries (user_id, month);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text,
  body text,
  category text check (category in ('general', 'event', 'grant', 'giveaway', 'advert')),
  image_url text,
  is_published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  standard_price numeric,
  member_price numeric,
  selar_url text,
  image_url text,
  category text check (category in ('identity', 'health', 'relationships', 'career')),
  is_active boolean default true
);

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

grant execute on function public.current_user_role() to anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.sync_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    name,
    email,
    phone,
    gender,
    avatar_url,
    role,
    created_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'gender',
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_user_meta_data ->> 'role', 'user'),
    coalesce(new.created_at, timezone('utc', now()))
  )
  on conflict (id) do update
  set
    name = excluded.name,
    email = excluded.email,
    phone = excluded.phone,
    gender = excluded.gender,
    avatar_url = excluded.avatar_url;

  return new;
end;
$$;

drop trigger if exists on_auth_user_synced on auth.users;

create trigger on_auth_user_synced
after insert or update on auth.users
for each row
execute function public.sync_auth_user();

insert into public.users (
  id,
  name,
  email,
  phone,
  gender,
  avatar_url,
  role,
  created_at
)
select
  auth_user.id,
  coalesce(auth_user.raw_user_meta_data ->> 'name', split_part(coalesce(auth_user.email, ''), '@', 1)),
  auth_user.email,
  auth_user.raw_user_meta_data ->> 'phone',
  auth_user.raw_user_meta_data ->> 'gender',
  auth_user.raw_user_meta_data ->> 'avatar_url',
  coalesce(auth_user.raw_user_meta_data ->> 'role', 'user'),
  coalesce(auth_user.created_at, timezone('utc', now()))
from auth.users as auth_user
on conflict (id) do update
set
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  gender = excluded.gender,
  avatar_url = excluded.avatar_url;

alter table public.users enable row level security;
alter table public.memberships enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.payment_intents enable row level security;
alter table public.fashion_products enable row level security;
alter table public.fashion_orders enable row level security;
alter table public.tailoring_orders enable row level security;
alter table public.training_registrations enable row level security;
alter table public.advert_submissions enable row level security;
alter table public.giveaway_entries enable row level security;
alter table public.announcements enable row level security;
alter table public.courses enable row level security;

drop policy if exists users_select_self_or_admin on public.users;
create policy users_select_self_or_admin on public.users
for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_self_or_admin on public.users
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (
  public.is_admin()
  or (
    id = auth.uid()
    and coalesce(role, 'user') = coalesce(public.current_user_role(), 'user')
  )
);

drop policy if exists memberships_select_own_or_admin on public.memberships;
create policy memberships_select_own_or_admin on public.memberships
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists memberships_admin_write on public.memberships;
create policy memberships_admin_write on public.memberships
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists service_categories_public_read on public.service_categories;
create policy service_categories_public_read on public.service_categories
for select to public
using (true);

drop policy if exists service_categories_admin_write on public.service_categories;
create policy service_categories_admin_write on public.service_categories
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services
for select to public
using (is_active = true or public.is_admin());

drop policy if exists services_admin_write on public.services;
create policy services_admin_write on public.services
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists appointments_select_own_or_admin on public.appointments;
create policy appointments_select_own_or_admin on public.appointments
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists appointments_admin_update on public.appointments;
create policy appointments_admin_update on public.appointments
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists payments_select_own_or_admin on public.payments;
create policy payments_select_own_or_admin on public.payments
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists payment_intents_select_own_or_admin on public.payment_intents;
create policy payment_intents_select_own_or_admin on public.payment_intents
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists fashion_products_public_read on public.fashion_products;
create policy fashion_products_public_read on public.fashion_products
for select to public
using (is_active = true or public.is_admin());

drop policy if exists fashion_products_admin_write on public.fashion_products;
create policy fashion_products_admin_write on public.fashion_products
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists fashion_orders_select_own_or_admin on public.fashion_orders;
create policy fashion_orders_select_own_or_admin on public.fashion_orders
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists fashion_orders_admin_update on public.fashion_orders;
create policy fashion_orders_admin_update on public.fashion_orders
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists tailoring_orders_select_own_or_admin on public.tailoring_orders;
create policy tailoring_orders_select_own_or_admin on public.tailoring_orders
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists tailoring_orders_insert_own_or_admin on public.tailoring_orders;
create policy tailoring_orders_insert_own_or_admin on public.tailoring_orders
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists tailoring_orders_admin_update on public.tailoring_orders;
create policy tailoring_orders_admin_update on public.tailoring_orders
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists training_registrations_select_own_or_admin on public.training_registrations;
create policy training_registrations_select_own_or_admin on public.training_registrations
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists training_registrations_insert_own_or_admin on public.training_registrations;
create policy training_registrations_insert_own_or_admin on public.training_registrations
for insert to authenticated
with check (
  public.is_admin()
  or (user_id = auth.uid() and status = 'registered')
);

drop policy if exists training_registrations_update_own_or_admin on public.training_registrations;
create policy training_registrations_update_own_or_admin on public.training_registrations
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (
  public.is_admin()
  or (user_id = auth.uid() and status = 'registered')
);

drop policy if exists advert_submissions_public_insert on public.advert_submissions;
create policy advert_submissions_public_insert on public.advert_submissions
for insert to public
with check (
  coalesce(status, 'pending') = 'pending'
  and admin_notes is null
);

drop policy if exists advert_submissions_admin_read on public.advert_submissions;
create policy advert_submissions_admin_read on public.advert_submissions
for select to authenticated
using (public.is_admin());

drop policy if exists advert_submissions_admin_update on public.advert_submissions;
create policy advert_submissions_admin_update on public.advert_submissions
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists giveaway_entries_select_own_or_admin on public.giveaway_entries;
create policy giveaway_entries_select_own_or_admin on public.giveaway_entries
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists giveaway_entries_insert_own_or_admin on public.giveaway_entries;
create policy giveaway_entries_insert_own_or_admin on public.giveaway_entries
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists giveaway_entries_update_own_or_admin on public.giveaway_entries;
create policy giveaway_entries_update_own_or_admin on public.giveaway_entries
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists announcements_public_read on public.announcements;
create policy announcements_public_read on public.announcements
for select to public
using (is_published = true or public.is_admin());

drop policy if exists announcements_admin_write on public.announcements;
create policy announcements_admin_write on public.announcements
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists courses_public_read on public.courses;
create policy courses_public_read on public.courses
for select to public
using (is_active = true or public.is_admin());

drop policy if exists courses_admin_write on public.courses;
create policy courses_admin_write on public.courses
for all to authenticated
using (public.is_admin())
with check (public.is_admin());