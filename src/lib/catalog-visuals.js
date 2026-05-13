const fashionFallbacks = {
  accessories:
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80',
  bags:
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
  default:
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
  eyewear:
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80',
  footwear:
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
  'rtw-female':
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
  'rtw-male':
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
}

const serviceFallbacks = {
  'beauty-studio':
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80',
  'bridal-and-events':
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
  default:
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
  'grooming-lounge':
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80',
  'spa-and-wellness':
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80',
}

export function getFashionImage(product, index = 0) {
  const images = product?.image_urls?.filter(Boolean) ?? []

  if (images[index]) {
    return images[index]
  }

  if (images[0]) {
    return images[0]
  }

  return fashionFallbacks[product?.category] ?? fashionFallbacks.default
}

export function getFashionGallery(product) {
  const images = product?.image_urls?.filter(Boolean) ?? []

  return images.length ? images : [getFashionImage(product)]
}

export function getServiceImage(service) {
  return service?.image_url || serviceFallbacks[service?.category_id] || serviceFallbacks.default
}