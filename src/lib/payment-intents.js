import { supabase } from './supabase'

async function invokePaymentFunction(name, body) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { data, error } = await supabase.functions.invoke(name, { body })

  if (error) {
    throw error
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data
}

export function createPaymentIntent(body) {
  return invokePaymentFunction('payment-intent', body)
}

export function verifyPaymentIntent(body) {
  return invokePaymentFunction('payment-verify', body)
}