export const PHOTOBOOTH_ADDON_PRICE = 7500

export function getPricing(item, isMember = false, options = {}) {
  if (!item) {
    return 0
  }

  const wantsHomeService =
    options.serviceType === 'home' || options.isHomeService === true

  if (wantsHomeService) {
    const homeServicePrice = isMember
      ? item.home_service_member_price
      : item.home_service_standard_price

    if (homeServicePrice !== null && homeServicePrice !== undefined) {
      return Number(homeServicePrice)
    }
  }

  const defaultPrice = isMember ? item.member_price : item.standard_price
  const fallbackPrice = isMember ? item.standard_price : item.member_price

  return Number(defaultPrice ?? fallbackPrice ?? 0)
}

export function getBookingTotal(service, isMember = false, options = {}) {
  const basePrice = getPricing(service, isMember, options)
  const photoboothPrice = options.photoboothPrice ?? PHOTOBOOTH_ADDON_PRICE

  return basePrice + (options.addonPhotobooth ? photoboothPrice : 0)
}