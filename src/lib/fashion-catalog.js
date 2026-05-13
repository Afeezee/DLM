const categoryLabels = {
  accessories: 'Accessories',
  bags: 'Bags',
  eyewear: 'Eyewear',
  footwear: 'Footwear',
  'rtw-female': 'RTW Female',
  'rtw-male': 'RTW Male',
}

export const fallbackFashionProducts = [
  {
    id: 'rtw-female-signature-kaftan',
    name: 'Signature Silk Kaftan',
    category: 'rtw-female',
    description:
      'A fluid ready-to-wear kaftan designed for elegant day events, dinner hosting, and polished weekend dressing.',
    standard_price: 42000,
    member_price: 35000,
    image_urls: [],
    stock_quantity: 7,
    is_active: true,
  },
  {
    id: 'rtw-female-tailored-set',
    name: 'Tailored Co-ord Set',
    category: 'rtw-female',
    description:
      'Structured two-piece styling with a refined silhouette and premium finishing for all-day comfort.',
    standard_price: 38000,
    member_price: 32000,
    image_urls: [],
    stock_quantity: 5,
    is_active: true,
  },
  {
    id: 'rtw-male-lounge-set',
    name: 'Executive Lounge Set',
    category: 'rtw-male',
    description:
      'A clean relaxed-fit set for men who want understated luxury and effortless styling.',
    standard_price: 36000,
    member_price: 29500,
    image_urls: [],
    stock_quantity: 9,
    is_active: true,
  },
  {
    id: 'bag-structured-tote',
    name: 'Structured Leather Tote',
    category: 'bags',
    description:
      'A premium tote with spacious interior organisation for workdays, travel, and elevated daily use.',
    standard_price: 28500,
    member_price: 23500,
    image_urls: [],
    stock_quantity: 4,
    is_active: true,
  },
  {
    id: 'footwear-soft-mule',
    name: 'Soft Leather Mule',
    category: 'footwear',
    description:
      'Minimal heeled footwear with a cushioned finish that works for studio visits and social outings alike.',
    standard_price: 22000,
    member_price: 18000,
    image_urls: [],
    stock_quantity: 12,
    is_active: true,
  },
  {
    id: 'eyewear-amber-frame',
    name: 'Amber Statement Frame',
    category: 'eyewear',
    description:
      'Expressive eyewear with a lightweight feel and a sculpted frame for standout everyday styling.',
    standard_price: 17500,
    member_price: 14000,
    image_urls: [],
    stock_quantity: 8,
    is_active: true,
  },
  {
    id: 'accessories-gold-set',
    name: 'Gold Accent Jewelry Set',
    category: 'accessories',
    description:
      'A coordinated accessory set designed to finish occasion looks without overpowering them.',
    standard_price: 15000,
    member_price: 12000,
    image_urls: [],
    stock_quantity: 10,
    is_active: true,
  },
]

export function formatFashionCategory(category) {
  return categoryLabels[category] ?? category
}

export function deriveFashionCategories(products) {
  return [...new Set(products.map((product) => product.category))]
    .filter(Boolean)
    .map((category) => ({
      key: category,
      label: formatFashionCategory(category),
    }))
}