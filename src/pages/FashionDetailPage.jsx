import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Toast from '../components/ui/Toast'
import { useCart } from '../hooks/useCart'
import { useFashionProducts } from '../hooks/useFashionProducts'
import { useMembership } from '../hooks/useMembership'
import { getPricing } from '../lib/pricing'
import { formatCurrency } from '../utils/formatCurrency'

export default function FashionDetailPage() {
  const { id } = useParams()
  const { addItem, itemCount } = useCart()
  const { categories, isLoading, products } = useFashionProducts()
  const { isMember } = useMembership()
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')

  const product = products.find((entry) => String(entry.id) === id)

  if (isLoading) {
    return (
      <section className="shell py-16 sm:py-24">
        <div className="surface h-96 animate-pulse bg-white/70" />
      </section>
    )
  }

  if (!product) {
    return (
      <section className="shell py-16 sm:py-24">
        <Card className="mx-auto max-w-3xl p-8 text-center sm:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-primary">Product unavailable</p>
          <h1 className="mt-5 text-4xl sm:text-5xl">That product could not be found</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-brand-dark/68">
            Return to the fashion hub and choose another product from the current catalogue.
          </p>
          <Link to="/fashion" className="mt-8 inline-flex">
            <Button>Back to fashion</Button>
          </Link>
        </Card>
      </section>
    )
  }

  const displayedPrice = getPricing(product, isMember)
  const categoryLabel = categories.find((entry) => entry.key === product.category)?.label ?? product.category

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      image_url: product.image_urls?.[0] ?? null,
      member_price: product.member_price,
      name: product.name,
      price: displayedPrice,
      quantity,
      standard_price: product.standard_price,
    })

    setMessage(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart.`)
  }

  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">{categoryLabel}</Badge>
            <Badge tone="dark">{product.stock_quantity > 0 ? 'In stock' : 'Out of stock'}</Badge>
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[0.95] sm:text-6xl">{product.name}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-brand-dark/72">{product.description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Standard price</p>
              <p className="mt-3 text-2xl font-display">{formatCurrency(product.standard_price)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Member price</p>
              <p className="mt-3 text-2xl font-display">{formatCurrency(product.member_price ?? product.standard_price)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Cart items</p>
              <p className="mt-3 text-2xl font-display">{itemCount}</p>
            </Card>
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Purchase summary</p>
          <div className="mt-6 rounded-[24px] bg-brand-light/80 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-dark/45">Current display price</p>
            <p className="mt-2 text-4xl font-display">{formatCurrency(displayedPrice)}</p>
            <p className="mt-3 text-sm leading-6 text-brand-dark/65">
              The checkout flow uses your current displayed cart pricing and captures the delivery address before payment.
            </p>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-brand-dark">Quantity</label>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                -
              </button>
              <div className="flex h-11 min-w-16 items-center justify-center rounded-full bg-brand-secondary/20 px-4 font-semibold text-brand-dark">
                {quantity}
              </div>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark"
                onClick={() => setQuantity((current) => Math.min(product.stock_quantity ?? 1, current + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button disabled={product.stock_quantity < 1} onClick={handleAddToCart}>
              Add to cart
            </Button>
            <Link to="/fashion/checkout">
              <Button variant="secondary">Go to checkout</Button>
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            <Toast message={message} tone="success" />
            {product.stock_quantity < 1 ? (
              <Toast message="This product is currently out of stock." tone="error" />
            ) : null}
          </div>
        </Card>
      </div>
    </section>
  )
}