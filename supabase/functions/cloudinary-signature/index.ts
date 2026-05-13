import { corsHeaders } from '../_shared/cors.ts'
import {
  createJsonResponse,
  createSupabaseClients,
  getAuthenticatedUser,
} from '../_shared/payment-utils.ts'

const uploadFolders = {
  fashion: 'dlm/fashion',
  services: 'dlm/services',
} as const

function getCloudinaryConfig() {
  const cloudinaryUrl = Deno.env.get('CLOUDINARY_URL')

  if (cloudinaryUrl) {
    const parsed = new URL(cloudinaryUrl)

    return {
      apiKey: decodeURIComponent(parsed.username),
      apiSecret: decodeURIComponent(parsed.password),
      cloudName: parsed.hostname,
    }
  }

  const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')
  const apiKey = Deno.env.get('CLOUDINARY_API_KEY')
  const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary function secrets are not configured.')
  }

  return {
    apiKey,
    apiSecret,
    cloudName,
  }
}

async function ensureAdmin(adminClient: ReturnType<typeof createSupabaseClients>['adminClient'], userId: string) {
  const { data, error } = await adminClient
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (data?.role !== 'admin') {
    throw new Error('Forbidden')
  }
}

async function createSignature(folder: string, timestamp: number, apiSecret: string) {
  const payload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const encoded = new TextEncoder().encode(payload)
  const digest = await crypto.subtle.digest('SHA-1', encoded)

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

function getErrorStatus(message: string) {
  if (message === 'Unauthorized') {
    return 401
  }

  if (message === 'Forbidden') {
    return 403
  }

  return 400
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return createJsonResponse({ error: 'Method not allowed.' }, 405)
  }

  try {
    const { folder: folderKey } = await request.json()

    if (!folderKey || !(folderKey in uploadFolders)) {
      return createJsonResponse({ error: 'Unsupported Cloudinary upload folder.' }, 400)
    }

    const { adminClient, userClient } = createSupabaseClients(request)
    const user = await getAuthenticatedUser(userClient)
    await ensureAdmin(adminClient, user.id)

    const { apiKey, apiSecret, cloudName } = getCloudinaryConfig()
    const folder = uploadFolders[folderKey as keyof typeof uploadFolders]
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = await createSignature(folder, timestamp, apiSecret)

    return createJsonResponse({
      apiKey,
      cloudName,
      folder,
      signature,
      timestamp,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate a Cloudinary upload signature.'
    return createJsonResponse({ error: message }, getErrorStatus(message))
  }
})