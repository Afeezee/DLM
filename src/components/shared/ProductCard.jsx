import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ProductCard({
  category,
  imageUrl,
  memberPrice,
  price,
  standardPrice,
  stockQuantity,
  title,
  to,
}) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="surface flex h-full flex-col overflow-hidden"
    >
      <div className="relative h-44 bg-hero-mesh">
        {imageUrl ? (
          <img
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
            src={imageUrl}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,18,12,0.05),rgba(24,18,12,0.6))]" />
        <div className="absolute left-5 top-5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-dark/65">
          {category}
        </div>
        <div className="absolute bottom-5 right-5 rounded-full bg-brand-dark px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-light">
          {stockQuantity > 0 ? `${stockQuantity} in stock` : 'Out of stock'}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <h3 className="text-3xl">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-brand-dark/70">
            Standard {formatCurrency(standardPrice)}
          </p>
          <p className="mt-1 text-sm leading-6 text-brand-primary">
            Member {formatCurrency(memberPrice ?? standardPrice)}
          </p>
        </div>
        <div className="rounded-[24px] bg-brand-light/75 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-dark/45">Current display price</p>
          <p className="mt-2 text-2xl font-display">{formatCurrency(price)}</p>
        </div>
        <Link to={to} className="mt-auto inline-flex">
          <Button variant="secondary">View product</Button>
        </Link>
      </div>
    </motion.article>
  )
}