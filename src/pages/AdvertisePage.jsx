import { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Toast from '../components/ui/Toast'
import { supabase } from '../lib/supabase'

const initialForm = {
  advertDescription: '',
  businessName: '',
  contactName: '',
  creativeUrl: '',
  email: '',
  phone: '',
  preferredDuration: '',
}

export default function AdvertisePage() {
  const [form, setForm] = useState(initialForm)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!supabase) {
      setErrorMessage('Supabase is not configured for advert submission in this environment.')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.from('advert_submissions').insert({
      advert_description: form.advertDescription,
      business_name: form.businessName,
      contact_name: form.contactName,
      creative_url: form.creativeUrl,
      email: form.email,
      phone: form.phone,
      preferred_duration: form.preferredDuration,
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setForm(initialForm)
    setSuccessMessage('Your advert request has been submitted for review.')
  }

  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="grid gap-8 xl:grid-cols-[0.9fr,1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-primary">Advertise with DLM</p>
          <h1 className="mt-4 text-5xl leading-[0.95] sm:text-6xl">
            Submit your campaign brief and creative links for the DLM audience.
          </h1>
          <p className="mt-6 text-lg leading-8 text-brand-dark/72">
            The admin team reviews each advert submission before approval, pricing follow-up, and placement planning.
          </p>
          <div className="mt-8 space-y-3">
            <Toast message={errorMessage} tone="error" />
            <Toast message={successMessage} tone="success" />
          </div>
        </div>

        <Card className="p-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <Input label="Business name" name="businessName" onChange={handleChange} required value={form.businessName} />
            <Input label="Contact name" name="contactName" onChange={handleChange} required value={form.contactName} />
            <Input label="Email" name="email" onChange={handleChange} required type="email" value={form.email} />
            <Input label="Phone" name="phone" onChange={handleChange} required value={form.phone} />
            <Input
              label="Preferred duration"
              name="preferredDuration"
              onChange={handleChange}
              placeholder="Example: 2 weeks"
              required
              value={form.preferredDuration}
            />
            <Input
              label="Creative URL"
              name="creativeUrl"
              onChange={handleChange}
              placeholder="Google Drive, Dropbox, or campaign page"
              value={form.creativeUrl}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Advert description"
                name="advertDescription"
                onChange={handleChange}
                placeholder="Describe the offer, audience, and assets included in the campaign."
                required
                value={form.advertDescription}
              />
            </div>
            <div className="md:col-span-2">
              <Button disabled={isSubmitting} type="submit">
                Submit advert request
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  )
}