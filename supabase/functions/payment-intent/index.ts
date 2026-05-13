import { corsHeaders } from '../_shared/cors.ts'
import {
  createJsonResponse,
  createReference,
  createSupabaseClients,
  getActiveMembership,
  getAuthenticatedUser,
  getBookingTotal,
  getPricing,
} from '../_shared/payment-utils.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { paymentType, payload } = await request.json()

    if (!['appointment', 'fashion_order'].includes(paymentType)) {
      return createJsonResponse({ error: 'Unsupported payment type.' }, 400)
    }

    const { adminClient, userClient } = createSupabaseClients(request)
    const user = await getAuthenticatedUser(userClient)
    const activeMembership = await getActiveMembership(adminClient, user.id)
    const isMember = Boolean(activeMembership)

    if (paymentType === 'appointment') {
      const { data: service, error: serviceError } = await adminClient
        .from('services')
        .select('*')
        .eq('id', payload.serviceId)
        .eq('is_active', true)
        .maybeSingle()

      if (serviceError) {
        throw serviceError
      }

      if (!service) {
        throw new Error('The selected service is not available.')
      }

      const serviceType = service.has_home_service ? payload.serviceType : 'walk-in'
      const amount = getBookingTotal(service, isMember, {
        addonPhotobooth: Boolean(payload.addonPhotobooth),
        serviceType,
      })
      const reference = createReference('DLM-APPOINTMENT')
      const normalizedPayload = {
        addonPhotobooth: Boolean(payload.addonPhotobooth),
        address: serviceType === 'home' ? payload.address ?? null : null,
        date: payload.date,
        notes: payload.notes ?? '',
        serviceId: service.id,
        serviceType,
        timeSlot: payload.timeSlot,
      }

      const { error: paymentError } = await adminClient.from('payments').insert({
        amount,
        payment_type: 'appointment',
        paystack_reference: reference,
        status: 'pending',
        user_id: user.id,
      })

      if (paymentError) {
        throw paymentError
      }

      const { error: intentError } = await adminClient.from('payment_intents').insert({
        amount,
        is_member_applied: isMember,
        payload: normalizedPayload,
        payment_type: 'appointment',
        paystack_reference: reference,
        status: 'initialized',
        user_id: user.id,
      })

      if (intentError) {
        throw intentError
      }

      return createJsonResponse({
        amount,
        isMemberApplied: isMember,
        paymentType,
        reference,
      })
    }

    const requestedItems = Array.isArray(payload.items) ? payload.items : []

    if (!requestedItems.length) {
      return createJsonResponse({ error: 'At least one fashion item is required.' }, 400)
    }

    const productIds = [...new Set(requestedItems.map((item) => item.productId).filter(Boolean))]
    const { data: products, error: productError } = await adminClient
      .from('fashion_products')
      .select('id, name, standard_price, member_price, stock_quantity, is_active')
      .in('id', productIds)

    if (productError) {
      throw productError
    }

    const productMap = new Map((products ?? []).map((product) => [product.id, product]))
    const normalizedItems = requestedItems.map((item) => {
      const product = productMap.get(item.productId)

      if (!product || product.is_active === false) {
        throw new Error('One or more fashion products are unavailable.')
      }

      const quantity = Math.max(1, Number(item.quantity ?? 1))

      if (Number(product.stock_quantity ?? 0) < quantity) {
        throw new Error(`Insufficient stock for ${product.name}.`)
      }

      return {
        name: product.name,
        product_id: product.id,
        qty: quantity,
        unit_price: getPricing(product, isMember),
      }
    })

    const amount = normalizedItems.reduce(
      (total, item) => total + Number(item.unit_price) * Number(item.qty),
      0,
    )
    const reference = createReference('DLM-FASHION')

    const { error: paymentError } = await adminClient.from('payments').insert({
      amount,
      payment_type: 'fashion_order',
      paystack_reference: reference,
      status: 'pending',
      user_id: user.id,
    })

    if (paymentError) {
      throw paymentError
    }

    const { error: intentError } = await adminClient.from('payment_intents').insert({
      amount,
      is_member_applied: isMember,
      payload: {
        deliveryAddress: payload.deliveryAddress,
        items: normalizedItems,
        notes: payload.notes ?? '',
      },
      payment_type: 'fashion_order',
      paystack_reference: reference,
      status: 'initialized',
      user_id: user.id,
    })

    if (intentError) {
      throw intentError
    }

    return createJsonResponse({
      amount,
      isMemberApplied: isMember,
      paymentType,
      reference,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create this payment intent.'
    return createJsonResponse({ error: message }, message === 'Unauthorized' ? 401 : 400)
  }
})