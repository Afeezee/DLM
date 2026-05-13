const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset)

export function getCloudinaryUploadUrl() {
  if (!cloudName) {
    return null
  }

  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
}

export function getCloudinaryUploadPreset() {
  return uploadPreset ?? null
}