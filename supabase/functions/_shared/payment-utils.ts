import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'

export const PHOTOBOOTH_ADDON_PRICE = 7500
export type SupabaseClientType = ReturnType<typeof createClient>

function toNumber(value: unknown) {
  return Number(value ?? 0)
}

function getSupabaseEnv() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new Error('Supabase function environment variables are not configured.')
  }

  return {
    anonKey,
    serviceRoleKey,
    supabaseUrl,
  }
}

export function createSupabaseClients(request: Request) {
  const { anonKey, serviceRoleKey, supabaseUrl } = getSupabaseEnv()

  const authHeader = request.headers.get('Authorization') ?? ''

  return {
    adminClient: createClient(supabaseUrl, serviceRoleKey),
    userClient: createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }),
  }
}

export function createAdminClient() {
  const { serviceRoleKey, supabaseUrl } = getSupabaseEnv()
  return createClient(supabaseUrl, serviceRoleKey)
}

export function createJsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    status,
  })
}

export function createReference(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export async function getAuthenticatedUser(userClient: ReturnType<typeof createClient>) {
  const {
    data: { user },
    error,
  } = await userClient.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function getActiveMembership(adminClient: ReturnType<typeof createClient>, userId: string) {
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await adminClient
    .from('memberships')
    .select('id, end_date, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('end_date', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).find((membership) => !membership.end_date || membership.end_date >= today) ?? null
}

export function getPricing(item: Record<string, unknown>, isMember = false, options: Record<string, unknown> = {}) {
  const wantsHomeService = options.serviceType === 'home' || options.isHomeService === true

  if (wantsHomeService) {
    const homeServicePrice = isMember
      ? item.home_service_member_price
      : item.home_service_standard_price

    if (homeServicePrice !== null && homeServicePrice !== undefined) {
      return toNumber(homeServicePrice)
    }
  }

  const defaultPrice = isMember ? item.member_price : item.standard_price
  const fallbackPrice = isMember ? item.standard_price : item.member_price

  return toNumber(defaultPrice ?? fallbackPrice)
}

export function getBookingTotal(
  service: Record<string, unknown>,
  isMember = false,
  options: Record<string, unknown> = {},
) {
  const basePrice = getPricing(service, isMember, options)
  return basePrice + (options.addonPhotobooth ? PHOTOBOOTH_ADDON_PRICE : 0)
}

export async function verifyPaystackTransaction(reference: string) {
  const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY')

  if (!paystackSecret) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured.')
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${paystackSecret}`,
      'Content-Type': 'application/json',
    },
    method: 'GET',
  })

  const result = await response.json()

  if (!response.ok || !result?.status) {
    throw new Error(result?.message ?? 'Unable to verify this Paystack transaction.')
  }

  return result.data
}