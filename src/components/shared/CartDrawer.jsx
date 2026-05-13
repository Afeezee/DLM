import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { useCart } from '../../hooks/useCart'
import { formatCurrency } from '../../utils/formatCurrency'

const cartDrawerStorageKey = 'dlm-cart-drawer-collapsed'

function getInitialCollapsedState() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(cartDrawerStorageKey) === 'true'
}

export default function CartDrawer() {
  const { itemCount, items, subtotal } = useCart()
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(cartDrawerStorageKey, String(isCollapsed))
  }, [isCollapsed])

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 hidden xl:block">
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.button
            key="collapsed-cart"
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/70 bg-white/90 px-4 py-3 shadow-luxe backdrop-blur-xl"
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            onClick={() => setIsCollapsed(false)}
            type="button"
            whileHover={{ y: -3 }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-dark text-sm font-semibold uppercase tracking-[0.18em] text-brand-light">
              {itemCount}
            </span>
            <span className="flex flex-col items-start">
              <span className="text-[0.65rem] uppercase tracking-[0.24em] text-brand-dark/45">Cart</span>
              <span className="text-sm font-semibold text-brand-dark">{formatCurrency(subtotal)}</span>
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="expanded-cart"
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-80"
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
          >
            <Card className="pointer-events-auto border-white/70 bg-white/90 p-5 shadow-[0_24px_70px_rgba(57,40,23,0.16)] backdrop-blur-xl">
              <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(182,84,45,0.5),transparent)]" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Cart preview</p>
                  <h3 className="mt-2 text-2xl">{itemCount} item{itemCount === 1 ? '' : 's'}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-brand-secondary/30 px-3 py-2 text-sm font-semibold text-brand-dark">
                    {formatCurrency(subtotal)}
                  </div>
                  <button
                    className="inline-flex h-10 items-center rounded-full bg-brand-dark px-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-light"
                    onClick={() => setIsCollapsed(true)}
                    type="button"
                  >
                    Minimize
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {items.length ? (
                  items.slice(0, 3).map((item, index) => (
                    <div key={item.id ?? index} className="flex items-center justify-between gap-3 text-sm text-brand-dark/70">
                      <span>{item.name} x {item.quantity ?? 1}</span>
                      <span>{formatCurrency((item.price ?? 0) * (item.quantity ?? 1))}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-brand-dark/60">
                    Add fashion products to your cart to review them here and continue to checkout.
                  </p>
                )}
              </div>
              <div className="mt-5">
                <Link to="/fashion/checkout" className="inline-flex w-full">
                  <Button className="w-full" variant="secondary">
                    Review checkout
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}