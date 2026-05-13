import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Toast from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'
import { useBooking } from '../hooks/useBooking'
import { useMembership } from '../hooks/useMembership'
import { useServices } from '../hooks/useServices'
import {
  getBookingTotal,
  getPricing,
  PHOTOBOOTH_ADDON_PRICE,
} from '../lib/pricing'
import {
  initializePaystackPayment,
  isPaystackConfigured,
} from '../lib/paystack'
import { createPaymentIntent, verifyPaymentIntent } from '../lib/payment-intents'
import { formatCurrency } from '../utils/formatCurrency'
import { generateTimeSlots } from '../utils/generateTimeSlots'

const timeSlots = generateTimeSlots('09:00', '18:00', 60)

export default function BookingPage() {
  const { serviceId } = useParams()
  const { user } = useAuth()
  const { booking, resetBooking, updateBooking } = useBooking()
  const { isMember } = useMembership()
  const { isLoading, services } = useServices()
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const service = services.find((entry) => String(entry.id) === serviceId)
  const serviceType = service?.has_home_service ? booking.serviceType : 'walk-in'
  const basePrice = service ? getPricing(service, isMember, { serviceType }) : 0
  const totalPrice = service
    ? getBookingTotal(service, isMember, {
        addonPhotobooth: booking.addonPhotobooth,
        serviceType,
      })
    : 0

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!service) {
      setErrorMessage('This service is not available for booking.')
      return
    }

    if (!booking.date || !booking.timeSlot) {
      setErrorMessage('Choose a date and time slot before continuing.')
      return
    }

    if (serviceType === 'home' && !booking.address.trim()) {
      setErrorMessage('Home service bookings require an address before payment.')
      return
    }

    if (!user?.email) {
      setErrorMessage('A signed-in user with an email address is required for booking payments.')
      return
    }

    setIsSubmitting(true)

    try {
      const intent = await createPaymentIntent({
        paymentType: 'appointment',
        payload: {
          addonPhotobooth: booking.addonPhotobooth,
          address: serviceType === 'home' ? booking.address : null,
          date: booking.date,
          notes: booking.notes,
          serviceId: service.id,
          serviceType,
          timeSlot: booking.timeSlot,
        },
      })

      if (!isPaystackConfigured) {
        await verifyPaymentIntent({
          mode: 'preview',
          reference: intent.reference,
        })
        resetBooking()
        setSuccessMessage('Preview booking saved as pending because Paystack is not configured yet.')
        setIsSubmitting(false)
        return
      }

      await initializePaystackPayment({
        amount: Number(intent.amount ?? totalPrice) * 100,
        callback: async (response) => {
          try {
            await verifyPaymentIntent({ reference: response.reference })
            resetBooking()
            setSuccessMessage('Payment completed and your appointment request has been recorded.')
          } catch (error) {
            setErrorMessage(error.message)
          } finally {
            setIsSubmitting(false)
          }
        },
        email: user.email,
        metadata: {
          payment_type: 'appointment',
          reference: intent.reference,
        },
        onClose: () => {
          setIsSubmitting(false)
        },
        ref: intent.reference,
      })
    } catch (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="shell py-16 sm:py-24">
        <div className="surface h-96 animate-pulse bg-white/70" />
      </section>
    )
  }

  if (!service) {
    return (
      <section className="shell py-16 sm:py-24">
        <Card className="mx-auto max-w-3xl p-8 text-center sm:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-primary">Booking unavailable</p>
          <h1 className="mt-5 text-4xl sm:text-5xl">That service is not available</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-brand-dark/68">
            Return to the catalogue and choose another service to continue booking.
          </p>
          <Link to="/services" className="mt-8 inline-flex">
            <Button>Back to services</Button>
          </Link>
        </Card>
      </section>
    )
  }

  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-primary">Booking flow</p>
          <h1 className="mt-4 text-5xl leading-[0.95] sm:text-6xl">Book {service.name} with the correct service and add-on pricing.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-brand-dark/72">{service.description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Base price</p>
              <p className="mt-3 text-2xl font-display">{formatCurrency(basePrice)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Photobooth add-on</p>
              <p className="mt-3 text-2xl font-display">{formatCurrency(PHOTOBOOTH_ADDON_PRICE)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Duration</p>
              <p className="mt-3 text-2xl font-display">{service.duration_mins} mins</p>
            </Card>
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Select
              label="Service type"
              name="serviceType"
              onChange={(event) => updateBooking('serviceType', event.target.value)}
              value={serviceType}
            >
              <option value="walk-in">Walk-in appointment</option>
              {service.has_home_service ? <option value="home">Home service</option> : null}
            </Select>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Appointment date"
                min={new Date().toISOString().split('T')[0]}
                name="date"
                onChange={(event) => updateBooking('date', event.target.value)}
                type="date"
                value={booking.date}
              />
              <Select
                label="Time slot"
                name="timeSlot"
                onChange={(event) => updateBooking('timeSlot', event.target.value)}
                value={booking.timeSlot}
              >
                <option value="">Select a time</option>
                {timeSlots.map((timeSlot) => (
                  <option key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </option>
                ))}
              </Select>
            </div>

            {serviceType === 'home' ? (
              <Input
                label="Home service address"
                name="address"
                onChange={(event) => updateBooking('address', event.target.value)}
                placeholder="Enter your service address"
                value={booking.address}
              />
            ) : null}

            <label className="flex items-start gap-3 rounded-[24px] bg-brand-light/75 p-4">
              <input
                checked={booking.addonPhotobooth}
                className="mt-1 h-4 w-4"
                onChange={(event) => updateBooking('addonPhotobooth', event.target.checked)}
                type="checkbox"
              />
              <span>
                <span className="block text-sm font-semibold text-brand-dark">Add photobooth service</span>
                <span className="mt-1 block text-sm leading-6 text-brand-dark/65">
                  Toggle this add-on to include an extra {formatCurrency(PHOTOBOOTH_ADDON_PRICE)} in the booking total.
                </span>
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-dark">Booking notes</span>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-brand-dark/10 bg-white px-4 py-3 outline-none transition focus:border-brand-primary"
                name="notes"
                onChange={(event) => updateBooking('notes', event.target.value)}
                placeholder="Optional notes for the DLM coordinator"
                value={booking.notes}
              />
            </label>

            <div className="rounded-[28px] bg-brand-light/75 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Booking total</p>
              <p className="mt-3 text-4xl font-display">{formatCurrency(totalPrice)}</p>
              <p className="mt-3 text-sm leading-6 text-brand-dark/65">
                {isPaystackConfigured
                  ? 'Paystack will open with a server-validated member-aware amount.'
                  : 'Paystack is not configured yet, so this booking will be stored as a pending preview request via the payment intent flow.'}
              </p>
            </div>

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? 'Processing booking...'
                : isPaystackConfigured
                  ? 'Continue to Paystack'
                  : 'Save preview booking'}
            </Button>

            <div className="space-y-3">
              <Toast message={errorMessage} tone="error" />
              <Toast message={successMessage} tone="success" />
            </div>
          </form>
        </Card>
      </div>
    </section>
  )
}