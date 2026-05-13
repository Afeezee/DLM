import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import PricingBadge from './PricingBadge'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ServiceCard({
  ctaLabel = 'View details',
  description,
  eyebrow,
  memberPrice,
  price,
  standardPrice,
  title,
  to,
}) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="surface flex h-full flex-col gap-5 p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-xs uppercase tracking-[0.24em] text-brand-primary">{eyebrow}</p>
          ) : null}
          <h3 className="mt-2 text-3xl">{title}</h3>
        </div>
        {price !== null && price !== undefined ? <PricingBadge amount={price} /> : null}
      </div>
      <div>
        <p className="mt-3 text-sm leading-6 text-brand-dark/70">{description}</p>
      </div>
      {standardPrice !== null && standardPrice !== undefined ? (
        <div className="grid gap-3 rounded-[24px] bg-brand-light/80 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-dark/45">Standard</p>
            <p className="mt-2 text-lg font-semibold text-brand-dark">
              {formatCurrency(standardPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-dark/45">Member</p>
            <p className="mt-2 text-lg font-semibold text-brand-primary">
              {formatCurrency(memberPrice ?? standardPrice)}
            </p>
          </div>
        </div>
      ) : null}
      {to ? (
        <Link to={to} className="mt-auto inline-flex">
          <Button variant="secondary">{ctaLabel}</Button>
        </Link>
      ) : null}
    </motion.article>
  )
}