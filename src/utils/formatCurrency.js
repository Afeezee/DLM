const formatter = new Intl.NumberFormat('en-NG', {
  currency: 'NGN',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function formatCurrency(value = 0) {
  const numericValue = Number(value)
  return formatter.format(Number.isNaN(numericValue) ? 0 : numericValue)
}