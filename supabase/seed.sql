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