const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
const paystackScriptUrl = 'https://js.paystack.co/v1/inline.js'

function wrapPaystackHandler(handler) {
  if (typeof handler !== 'function') {
    return function noop() {}
  }

  return function paystackHandler(...args) {
    void Promise.resolve(handler(...args))
  }
}

export const isPaystackConfigured = Boolean(publicKey)

export function getPaystackPublicKey() {
  return publicKey ?? null
}

export function loadPaystackScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Paystack can only load in the browser.'))
  }

  if (window.PaystackPop) {
    return Promise.resolve(window.PaystackPop)
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${paystackScriptUrl}"]`)

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.PaystackPop))
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Paystack.')))
      return
    }

    const script = document.createElement('script')
    script.src = paystackScriptUrl
    script.async = true
    script.onload = () => resolve(window.PaystackPop)
    script.onerror = () => reject(new Error('Failed to load Paystack.'))
    document.body.appendChild(script)
  })
}

export async function initializePaystackPayment(config) {
  if (!publicKey) {
    throw new Error('VITE_PAYSTACK_PUBLIC_KEY is not configured.')
  }

  const {
    callback,
    onClose,
    ref,
    reference,
    ...paymentConfig
  } = config ?? {}

  const paymentReference = reference ?? ref

  const PaystackPop = await loadPaystackScript()

  if (!PaystackPop) {
    throw new Error('Paystack failed to initialise.')
  }

  const handler = PaystackPop.setup({
    key: publicKey,
    ...paymentConfig,
    callback: wrapPaystackHandler(callback),
    onClose: wrapPaystackHandler(onClose),
    ref: paymentReference,
  })

  handler.openIframe()
  return handler
}