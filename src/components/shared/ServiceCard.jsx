import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import PricingBadge from './PricingBadge'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ServiceCard({
  ctaLabel = 'View details',
  description,
  eyebrow,
  imageUrl,
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,18,12,0.08),rgba(24,18,12,0.65))]" />
        {eyebrow ? (
          <div className="absolute left-5 top-5 rounded-full bg-white/88 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-dark/70">
            {eyebrow}
          </div>
        ) : null}
        {price !== null && price !== undefined ? (
          <div className="absolute bottom-5 right-5">
            <PricingBadge amount={price} />
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <h3 className="text-3xl">{title}</h3>
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
      </div>
    </motion.article>
  )
}