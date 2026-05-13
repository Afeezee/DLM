export function createPaymentReference(prefix) {
  return `${prefix}-${Date.now()}`
}