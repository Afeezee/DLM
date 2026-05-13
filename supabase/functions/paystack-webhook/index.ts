import { corsHeaders } from '../_shared/cors.ts'
import {
  createAdminClient,
  createJsonResponse,
  verifyPaystackTransaction,
} from '../_shared/payment-utils.ts'
import {
  finalizePaymentIntent,
  loadPaymentIntent,
  markPaymentFailed,
} from '../_shared/payment-finalization.ts'

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

async function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY')

  if (!paystackSecret) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured.')
  }

  if (!signature) {
    return false
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(paystackSecret),
    { hash: 'SHA-512', name: 'HMAC' },
    false,
    ['sign'],
  )

  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  return bufferToHex(digest) === signature
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rawBody = await request.text()
    const isSignatureValid = await verifyWebhookSignature(
      rawBody,
      request.headers.get('x-paystack-signature'),
    )

    if (!isSignatureValid) {
      return createJsonResponse({ error: 'Invalid Paystack signature.' }, 401)
    }

    const payload = JSON.parse(rawBody)

    if (payload.event !== 'charge.success') {
      return createJsonResponse({ received: true, skipped: payload.event ?? 'unknown' })
    }

    const reference = payload.data?.reference

    if (!reference) {
      return createJsonResponse({ error: 'No payment reference was provided.' }, 400)
    }

    const adminClient = createAdminClient()
    const intent = await loadPaymentIntent(adminClient, reference)

    if (!intent) {
      return createJsonResponse({ received: true, skipped: 'intent-not-found' })
    }

    if (['preview', 'verified'].includes(String(intent.status))) {
      return createJsonResponse({ received: true, status: intent.status })
    }

    const verification = await verifyPaystackTransaction(reference)

    if (verification.status !== 'success') {
      await markPaymentFailed(adminClient, reference)
      return createJsonResponse({ error: 'This Paystack payment has not been completed.' }, 400)
    }

    if (Number(verification.amount ?? 0) / 100 !== Number(intent.amount ?? 0)) {
      await markPaymentFailed(adminClient, reference)
      return createJsonResponse({ error: 'Verified payment amount does not match the expected total.' }, 400)
    }

    await finalizePaymentIntent(adminClient, intent, 'success', 'paystack')

    return createJsonResponse({ received: true, status: 'success' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process the Paystack webhook.'
    return createJsonResponse({ error: message }, 400)
  }
})