import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Toast from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import {
  initializePaystackPayment,
  isPaystackConfigured,
} from '../lib/paystack'
import { createPaymentIntent, verifyPaymentIntent } from '../lib/payment-intents'
import { formatCurrency } from '../utils/formatCurrency'

export default function FashionCheckoutPage() {
  const { user } = useAuth()
  const { clearCart, itemCount, items, removeItem, subtotal, updateQuantity } = useCart()
  const [form, setForm] = useState({ deliveryAddress: '', notes: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleCheckout = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!items.length) {
      setErrorMessage('Your cart is empty.')
      return
    }

    if (!form.deliveryAddress.trim()) {
      setErrorMessage('Delivery address is required before checkout.')
      return
    }

    if (!user?.email) {
      setErrorMessage('A signed-in user with an email address is required for checkout.')
      return
    }

    setIsSubmitting(true)

    try {
      const intent = await createPaymentIntent({
        paymentType: 'fashion_order',
        payload: {
          deliveryAddress: form.deliveryAddress,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity ?? 1,
          })),
          notes: form.notes,
        },
      })

      if (!isPaystackConfigured) {
        await verifyPaymentIntent({
          mode: 'preview',
          reference: intent.reference,
        })
        clearCart()
        setSuccessMessage('Preview order saved as pending because Paystack is not configured yet.')
        setIsSubmitting(false)
        return
      }

      await initializePaystackPayment({
        amount: Number(intent.amount ?? subtotal) * 100,
        callback: async (response) => {
          try {
            await verifyPaymentIntent({ reference: response.reference })
            clearCart()
            setSuccessMessage('Payment completed and your fashion order has been recorded.')
          } catch (error) {
            setErrorMessage(error.message)
          } finally {
            setIsSubmitting(false)
          }
        },
        email: user.email,
        metadata: {
          item_count: itemCount,
          payment_type: 'fashion_order',
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

  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-primary">Fashion checkout</p>
          <h1 className="mt-4 text-5xl leading-[0.95] sm:text-6xl">Confirm delivery details and complete payment.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-brand-dark/72">
            Orders are captured on the platform and fulfilled manually by the DLM team after payment confirmation.
          </p>

          <div className="mt-8 space-y-4">
            {items.length ? (
              items.map((item) => (
                <Card key={item.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl">{item.name}</h2>
                      <p className="mt-2 text-sm text-brand-dark/60">
                        Unit price {formatCurrency(item.price ?? 0)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-dark/10 bg-white"
                        onClick={() => updateQuantity(item.id, (item.quantity ?? 1) - 1)}
                      >
                        -
                      </button>
                      <div className="rounded-full bg-brand-secondary/20 px-4 py-2 text-sm font-semibold text-brand-dark">
                        {item.quantity ?? 1}
                      </div>
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-dark/10 bg-white"
                        onClick={() => updateQuantity(item.id, (item.quantity ?? 1) + 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-brand-dark/10 px-4 py-2 text-sm font-medium text-brand-dark/70"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8">
                <h2 className="text-3xl">Your cart is empty</h2>
                <p className="mt-3 text-sm leading-6 text-brand-dark/65">
                  Add products from the fashion catalogue before continuing to checkout.
                </p>
                <Link to="/fashion" className="mt-6 inline-flex">
                  <Button>Browse fashion</Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleCheckout}>
            <Input
              label="Delivery address"
              name="deliveryAddress"
              onChange={handleChange}
              placeholder="Enter delivery address"
              value={form.deliveryAddress}
            />

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-dark">Order notes</span>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-brand-dark/10 bg-white px-4 py-3 outline-none transition focus:border-brand-primary"
                name="notes"
                onChange={handleChange}
                placeholder="Optional delivery instructions or order notes"
                value={form.notes}
              />
            </label>

            <div className="rounded-[28px] bg-brand-light/75 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Order total</p>
              <p className="mt-3 text-4xl font-display">{formatCurrency(subtotal)}</p>
              <p className="mt-3 text-sm leading-6 text-brand-dark/65">
                {isPaystackConfigured
                  ? 'Paystack will open after the server validates your current cart total.'
                  : 'Paystack is not configured yet, so checkout will save a preview order with pending payment status through the payment intent flow.'}
              </p>
            </div>

            <Button className="w-full" disabled={!items.length || isSubmitting} type="submit">
              {isSubmitting
                ? 'Processing checkout...'
                : isPaystackConfigured
                  ? 'Pay with Paystack'
                  : 'Save preview order'}
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