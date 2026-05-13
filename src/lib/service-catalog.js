export const fallbackServiceCategories = [
  {
    id: 'beauty-studio',
    name: 'Beauty Studio',
    slug: 'beauty-studio',
    icon_url: null,
    display_order: 1,
  },
  {
    id: 'spa-and-wellness',
    name: 'Spa and Wellness',
    slug: 'spa-and-wellness',
    icon_url: null,
    display_order: 2,
  },
  {
    id: 'grooming-lounge',
    name: 'Grooming Lounge',
    slug: 'grooming-lounge',
    icon_url: null,
    display_order: 3,
  },
  {
    id: 'bridal-and-events',
    name: 'Bridal and Events',
    slug: 'bridal-and-events',
    icon_url: null,
    display_order: 4,
  },
]

export const fallbackServices = [
  {
    id: 'signature-soft-glam',
    category_id: 'beauty-studio',
    name: 'Signature Soft Glam',
    description:
      'A polished studio makeup experience with skin preparation, premium finishing, and touch-up guidance.',
    standard_price: 18000,
    member_price: 14500,
    home_service_standard_price: 26000,
    home_service_member_price: 22000,
    duration_mins: 90,
    has_home_service: true,
    image_url: null,
    is_active: true,
  },
  {
    id: 'gele-styling-session',
    category_id: 'beauty-studio',
    name: 'Gele Styling Session',
    description:
      'Structured gele styling designed for weddings, celebrations, and portrait sessions with a refined finish.',
    standard_price: 8500,
    member_price: 6500,
    home_service_standard_price: 12000,
    home_service_member_price: 9500,
    duration_mins: 45,
    has_home_service: true,
    image_url: null,
    is_active: true,
  },
  {
    id: 'restorative-home-spa',
    category_id: 'spa-and-wellness',
    name: 'Restorative Home Spa',
    description:
      'A calming massage and body-care session coordinated for either the studio or your preferred location.',
    standard_price: 22000,
    member_price: 18000,
    home_service_standard_price: 30000,
    home_service_member_price: 24500,
    duration_mins: 75,
    has_home_service: true,
    image_url: null,
    is_active: true,
  },
  {
    id: 'executive-haircut-finish',
    category_id: 'grooming-lounge',
    name: 'Executive Haircut and Finish',
    description:
      'Precision grooming, line refinement, and finishing products tailored for a sharp everyday appearance.',
    standard_price: 7000,
    member_price: 5000,
    home_service_standard_price: null,
    home_service_member_price: null,
    duration_mins: 40,
    has_home_service: false,
    image_url: null,
    is_active: true,
  },
  {
    id: 'bridal-preview-session',
    category_id: 'bridal-and-events',
    name: 'Bridal Preview Session',
    description:
      'Trial makeup planning for wedding looks, including tone direction, timing, and finish preference alignment.',
    standard_price: 30000,
    member_price: 25000,
    home_service_standard_price: 38000,
    home_service_member_price: 32000,
    duration_mins: 120,
    has_home_service: true,
    image_url: null,
    is_active: true,
  },
  {
    id: 'event-beauty-concierge',
    category_id: 'bridal-and-events',
    name: 'Event Beauty Concierge',
    description:
      'A high-touch event preparation service for clients who need coordinated beauty support before occasions.',
    standard_price: 35000,
    member_price: 29000,
    home_service_standard_price: 45000,
    home_service_member_price: 38000,
    duration_mins: 150,
    has_home_service: true,
    image_url: null,
    is_active: true,
  },
]

export function attachServiceCategories(categories, services) {
  const categoryMap = Object.fromEntries(categories.map((category) => [category.id, category]))

  return services.map((service) => ({
    ...service,
    category: categoryMap[service.category_id] ?? null,
  }))
}