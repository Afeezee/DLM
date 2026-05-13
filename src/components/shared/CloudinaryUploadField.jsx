import { useId, useState } from 'react'
import { uploadCloudinaryImages } from '../../lib/cloudinary'
import Button from '../ui/Button'
import Toast from '../ui/Toast'

export default function CloudinaryUploadField({
  folder,
  helperText = '',
  label = 'Upload image',
  multiple = false,
  onUploaded,
  previews = [],
}) {
  const inputId = useId()
  const [errorMessage, setErrorMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files ?? [])

    if (!files.length) {
      return
    }

    setErrorMessage('')
    setIsUploading(true)

    try {
      const uploads = await uploadCloudinaryImages({ files, folder })
      onUploaded?.(uploads)
    } catch (uploadError) {
      setErrorMessage(uploadError.message)
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-3 rounded-[24px] border border-brand-dark/8 bg-white/65 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-dark">{label}</p>
          {helperText ? <p className="mt-1 text-sm text-brand-dark/60">{helperText}</p> : null}
        </div>
        <label
          htmlFor={inputId}
          className={isUploading ? 'pointer-events-none opacity-70' : ''}
        >
          <input
            id={inputId}
            accept="image/*"
            className="sr-only"
            multiple={multiple}
            onChange={(event) => void handleUpload(event)}
            type="file"
          />
          <Button as="span" variant="secondary">
            {isUploading ? 'Uploading...' : multiple ? 'Upload images' : 'Upload image'}
          </Button>
        </label>
      </div>

      <Toast message={errorMessage} tone="error" />

      {previews.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {previews.map((preview, index) => (
            <div key={`${preview}-${index}`} className="overflow-hidden rounded-[22px] border border-brand-dark/8 bg-white">
              <img alt={`Uploaded preview ${index + 1}`} className="h-32 w-full object-cover" src={preview} />
              <p className="truncate px-3 py-2 text-xs text-brand-dark/55">{preview}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}