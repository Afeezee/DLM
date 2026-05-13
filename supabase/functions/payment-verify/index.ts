import { corsHeaders } from '../_shared/cors.ts'
import {
  createJsonResponse,
  createSupabaseClients,
  getAuthenticatedUser,
  verifyPaystackTransaction,
} from '../_shared/payment-utils.ts'
import {
  finalizePaymentIntent,
  loadPaymentIntent,
  markPaymentFailed,
} from '../_shared/payment-finalization.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { mode = 'paystack', reference } = await request.json()

    if (!reference) {
      return createJsonResponse({ error: 'A paystack reference is required.' }, 400)
    }

    const { adminClient, userClient } = createSupabaseClients(request)
    const user = await getAuthenticatedUser(userClient)

    const intent = await loadPaymentIntent(adminClient, reference)

    if (!intent || intent.user_id !== user.id) {
      return createJsonResponse({ error: 'Payment intent not found.' }, 404)
    }

    if (['preview', 'verified'].includes(String(intent.status))) {
      return createJsonResponse({
        amount: intent.amount,
        paymentType: intent.payment_type,
        reference,
        status: intent.status,
      })
    }

    if (mode !== 'preview') {
      const verification = await verifyPaystackTransaction(reference)

      if (verification.status !== 'success') {
        await markPaymentFailed(adminClient, reference)

        return createJsonResponse({ error: 'This Paystack payment has not been completed.' }, 400)
      }

      if (Number(verification.amount ?? 0) / 100 !== Number(intent.amount ?? 0)) {
        await markPaymentFailed(adminClient, reference)

        return createJsonResponse({ error: 'Verified payment amount does not match the expected total.' }, 400)
      }
    }

    await finalizePaymentIntent(adminClient, intent, mode === 'preview' ? 'pending' : 'success', mode)

    return createJsonResponse({
      amount: intent.amount,
      paymentType: intent.payment_type,
      reference,
      status: mode === 'preview' ? 'preview' : 'success',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to verify this payment.'
    return createJsonResponse({ error: message }, message === 'Unauthorized' ? 401 : 400)
  }
})