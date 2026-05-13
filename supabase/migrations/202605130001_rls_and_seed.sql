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

insert into public.service_categories (name, slug, icon_url, display_order)
values
  ('Beauty Studio', 'beauty-studio', null, 1),
  ('Spa and Wellness', 'spa-and-wellness', null, 2),
  ('Grooming Lounge', 'grooming-lounge', null, 3),
  ('Bridal and Events', 'bridal-and-events', null, 4)
on conflict (slug) do update
set
  name = excluded.name,
  icon_url = excluded.icon_url,
  display_order = excluded.display_order;

with service_seed (
  category_slug,
  name,
  description,
  standard_price,
  member_price,
  home_service_standard_price,
  home_service_member_price,
  duration_mins,
  has_home_service,
  image_url,
  is_active
) as (
  values
    ('beauty-studio', 'Signature Soft Glam', 'A polished studio makeup experience with skin preparation, premium finishing, and touch-up guidance.', 18000, 14500, 26000, 22000, 90, true, null, true),
    ('beauty-studio', 'Gele Styling Session', 'Structured gele styling designed for weddings, celebrations, and portrait sessions with a refined finish.', 8500, 6500, 12000, 9500, 45, true, null, true),
    ('spa-and-wellness', 'Restorative Home Spa', 'A calming massage and body-care session coordinated for either the studio or your preferred location.', 22000, 18000, 30000, 24500, 75, true, null, true),
    ('grooming-lounge', 'Executive Haircut and Finish', 'Precision grooming, line refinement, and finishing products tailored for a sharp everyday appearance.', 7000, 5000, null, null, 40, false, null, true),
    ('bridal-and-events', 'Bridal Preview Session', 'Trial makeup planning for wedding looks, including tone direction, timing, and finish preference alignment.', 30000, 25000, 38000, 32000, 120, true, null, true),
    ('bridal-and-events', 'Event Beauty Concierge', 'A high-touch event preparation service for clients who need coordinated beauty support before occasions.', 35000, 29000, 45000, 38000, 150, true, null, true)
)
insert into public.services (
  category_id,
  name,
  description,
  standard_price,
  member_price,
  home_service_standard_price,
  home_service_member_price,
  duration_mins,
  has_home_service,
  image_url,
  is_active
)
select
  category.id,
  seed.name,
  seed.description,
  seed.standard_price,
  seed.member_price,
  seed.home_service_standard_price,
  seed.home_service_member_price,
  seed.duration_mins,
  seed.has_home_service,
  seed.image_url,
  seed.is_active
from service_seed as seed
join public.service_categories as category on category.slug = seed.category_slug
where not exists (
  select 1 from public.services as existing where existing.name = seed.name
);

with fashion_seed (
  name,
  category,
  description,
  standard_price,
  member_price,
  stock_quantity,
  is_active
) as (
  values
    ('Signature Silk Kaftan', 'rtw-female', 'A fluid ready-to-wear kaftan designed for elegant day events, dinner hosting, and polished weekend dressing.', 42000, 35000, 7, true),
    ('Tailored Co-ord Set', 'rtw-female', 'Structured two-piece styling with a refined silhouette and premium finishing for all-day comfort.', 38000, 32000, 5, true),
    ('Executive Lounge Set', 'rtw-male', 'A clean relaxed-fit set for men who want understated luxury and effortless styling.', 36000, 29500, 9, true),
    ('Structured Leather Tote', 'bags', 'A premium tote with spacious interior organisation for workdays, travel, and elevated daily use.', 28500, 23500, 4, true),
    ('Soft Leather Mule', 'footwear', 'Minimal heeled footwear with a cushioned finish that works for studio visits and social outings alike.', 22000, 18000, 12, true),
    ('Amber Statement Frame', 'eyewear', 'Expressive eyewear with a lightweight feel and a sculpted frame for standout everyday styling.', 17500, 14000, 8, true),
    ('Gold Accent Jewelry Set', 'accessories', 'A coordinated accessory set designed to finish occasion looks without overpowering them.', 15000, 12000, 10, true)
)
insert into public.fashion_products (
  name,
  category,
  description,
  standard_price,
  member_price,
  stock_quantity,
  is_active
)
select
  seed.name,
  seed.category,
  seed.description,
  seed.standard_price,
  seed.member_price,
  seed.stock_quantity,
  seed.is_active
from fashion_seed as seed
where not exists (
  select 1 from public.fashion_products as existing where existing.name = seed.name
);

with course_seed (
  title,
  description,
  standard_price,
  member_price,
  selar_url,
  image_url,
  category,
  is_active
) as (
  values
    ('Identity Reset Intensive', 'A guided confidence framework for women refining their voice, style decisions, and personal brand structure.', 25000, 18000, 'https://selar.co', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=80', 'identity', true),
    ('Luxury Service Business Blueprint', 'Templates, positioning prompts, and sales structure for women building elegant service brands.', 30000, 22000, 'https://selar.co', 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80', 'career', true),
    ('Relational Intelligence Studio', 'A practical course on boundaries, communication, and healthy connection in personal and work relationships.', 21000, 16000, 'https://selar.co', 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80', 'relationships', true)
)
insert into public.courses (
  title,
  description,
  standard_price,
  member_price,
  selar_url,
  image_url,
  category,
  is_active
)
select
  seed.title,
  seed.description,
  seed.standard_price,
  seed.member_price,
  seed.selar_url,
  seed.image_url,
  seed.category,
  seed.is_active
from course_seed as seed
where not exists (
  select 1 from public.courses as existing where existing.title = seed.title
);

with announcement_seed (
  title,
  body,
  category,
  is_published,
  published_at
) as (
  values
    ('Community updates now stream through DLM', 'Our studio is curating more public education drops, giveaway campaigns, and event-day updates directly from the platform.', 'general', true, '2025-01-10T10:00:00.000Z'::timestamp with time zone),
    ('Monthly giveaway registration is open', 'May entries are open. One community member will receive a service support package after the monthly selection round.', 'giveaway', true, '2025-01-08T10:00:00.000Z'::timestamp with time zone),
    ('DLM Tim-eout returns with a richer guest experience', 'The next DLM Tim-eout event is being curated around wellness, visibility, and elevated soft-life experiences.', 'event', true, '2025-01-05T10:00:00.000Z'::timestamp with time zone)
)
insert into public.announcements (
  title,
  body,
  category,
  is_published,
  published_at
)
select
  seed.title,
  seed.body,
  seed.category,
  seed.is_published,
  seed.published_at
from announcement_seed as seed
where not exists (
  select 1 from public.announcements as existing where existing.title = seed.title
);