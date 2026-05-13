import type { SupabaseClientType } from './payment-utils.ts'

export async function loadPaymentIntent(adminClient: SupabaseClientType, reference: string) {
  const { data, error } = await adminClient
    .from('payment_intents')
    .select('*')
    .eq('paystack_reference', reference)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function markPaymentFailed(adminClient: SupabaseClientType, reference: string) {
  const { error: paymentError } = await adminClient
    .from('payments')
    .update({ status: 'failed' })
    .eq('paystack_reference', reference)

  if (paymentError) {
    throw paymentError
  }

  const { error: intentError } = await adminClient
    .from('payment_intents')
    .update({ status: 'failed' })
    .eq('paystack_reference', reference)

  if (intentError) {
    throw intentError
  }
}

export async function finalizePaymentIntent(
  adminClient: SupabaseClientType,
  intent: Record<string, unknown>,
  paymentStatus: string,
  verificationMode: string,
) {
  const payload = intent.payload as Record<string, unknown>

  if (intent.payment_type === 'appointment') {
    const { data: existingAppointment, error: existingError } = await adminClient
      .from('appointments')
      .select('id')
      .eq('paystack_reference', intent.paystack_reference)
      .maybeSingle()

    if (existingError) {
      throw existingError
    }

    if (!existingAppointment) {
      const { error: appointmentError } = await adminClient.from('appointments').insert({
        addon_photobooth: payload.addonPhotobooth,
        address: payload.address,
        date: payload.date,
        is_member_price: intent.is_member_applied,
        notes: payload.notes,
        paystack_reference: intent.paystack_reference,
        price_paid: intent.amount,
        service_id: payload.serviceId,
        service_type: payload.serviceType,
        status: 'pending',
        time_slot: payload.timeSlot,
        user_id: intent.user_id,
      })

      if (appointmentError) {
        throw appointmentError
      }
    }
  }

  if (intent.payment_type === 'fashion_order') {
    const { data: existingOrder, error: existingError } = await adminClient
      .from('fashion_orders')
      .select('id')
      .eq('paystack_reference', intent.paystack_reference)
      .maybeSingle()

    if (existingError) {
      throw existingError
    }

    if (!existingOrder) {
      const { error: orderError } = await adminClient.from('fashion_orders').insert({
        delivery_address: payload.deliveryAddress,
        delivery_status: 'pending',
        items: payload.items,
        notes: payload.notes,
        paystack_reference: intent.paystack_reference,
        total_amount: intent.amount,
        user_id: intent.user_id,
      })

      if (orderError) {
        throw orderError
      }
    }
  }

  const { error: paymentError } = await adminClient
    .from('payments')
    .update({ status: paymentStatus })
    .eq('paystack_reference', intent.paystack_reference)

  if (paymentError) {
    throw paymentError
  }

  const { error: intentError } = await adminClient
    .from('payment_intents')
    .update({
      status: verificationMode === 'preview' ? 'preview' : 'verified',
      verified_at: new Date().toISOString(),
    })
    .eq('paystack_reference', intent.paystack_reference)

  if (intentError) {
    throw intentError
  }
}