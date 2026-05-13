import { supabase } from './supabase'

async function invokeCloudinaryFunction(body) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { data, error } = await supabase.functions.invoke('cloudinary-signature', { body })

  if (error) {
    throw error
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data
}

async function uploadSingleImage(file, folder) {
  const uploadConfig = await invokeCloudinaryFunction({ folder })
  const formData = new FormData()

  formData.append('api_key', uploadConfig.apiKey)
  formData.append('file', file)
  formData.append('folder', uploadConfig.folder)
  formData.append('signature', uploadConfig.signature)
  formData.append('timestamp', String(uploadConfig.timestamp))

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${uploadConfig.cloudName}/image/upload`,
    {
      body: formData,
      method: 'POST',
    },
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result?.error?.message ?? 'Unable to upload this image to Cloudinary.')
  }

  return {
    height: result.height,
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
  }
}

export async function uploadCloudinaryImages({ files, folder }) {
  const uploadFiles = Array.from(files ?? []).filter(Boolean)

  if (!uploadFiles.length) {
    return []
  }

  return Promise.all(uploadFiles.map((file) => uploadSingleImage(file, folder)))
}