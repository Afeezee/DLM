import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function PlaceholderPage({
  ctaLabel = 'Return home',
  ctaTo = '/',
  description,
  eyebrow = 'Coming next',
  title,
}) {
  return (
    <section className="shell py-16 sm:py-24">
      <Card className="mx-auto max-w-3xl p-8 text-center sm:p-12">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-primary">{eyebrow}</p>
        <h1 className="mt-5 text-4xl sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-brand-dark/68">{description}</p>
        <Link to={ctaTo} className="mt-8 inline-flex">
          <Button>{ctaLabel}</Button>
        </Link>
      </Card>
    </section>
  )
}