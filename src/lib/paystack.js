const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
const paystackScriptUrl = 'https://js.paystack.co/v1/inline.js'

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

  const PaystackPop = await loadPaystackScript()

  if (!PaystackPop) {
    throw new Error('Paystack failed to initialise.')
  }

  const handler = PaystackPop.setup({
    key: publicKey,
    ...config,
  })

  handler.openIframe()
  return handler
}