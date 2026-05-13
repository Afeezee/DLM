import { Link, useParams } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useMembership } from '../hooks/useMembership'
import { useServices } from '../hooks/useServices'
import { getServiceImage } from '../lib/catalog-visuals'
import { getPricing } from '../lib/pricing'
import { formatCurrency } from '../utils/formatCurrency'

export default function ServiceDetailPage() {
  const { id } = useParams()
  const { dataSource, isLoading, services } = useServices()
  const { isMember } = useMembership()

  const service = services.find((entry) => String(entry.id) === id)

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
          <p className="text-xs uppercase tracking-[0.3em] text-brand-primary">Service unavailable</p>
          <h1 className="mt-5 text-4xl sm:text-5xl">That service could not be found</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-brand-dark/68">
            Return to the catalogue and choose another experience from the current service list.
          </p>
          <Link to="/services" className="mt-8 inline-flex">
            <Button>Back to services</Button>
          </Link>
        </Card>
      </section>
    )
  }

  const walkInPrice = getPricing(service, isMember)
  const homePrice = service.has_home_service
    ? getPricing(service, isMember, { serviceType: 'home' })
    : null
  const heroImage = getServiceImage(service)

  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-sm">
            <img
              alt={service.name}
              className="h-[420px] w-full object-cover sm:h-[500px]"
              loading="lazy"
              src={heroImage}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge tone="accent">{service.category?.name ?? 'Service detail'}</Badge>
            <Badge tone="dark">{service.has_home_service ? 'Home or studio' : 'Studio only'}</Badge>
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[0.95] sm:text-6xl">{service.name}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-brand-dark/72">{service.description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Duration</p>
              <p className="mt-3 text-2xl font-display">{service.duration_mins} mins</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Mode</p>
              <p className="mt-3 text-2xl font-display">{service.has_home_service ? 'Flexible' : 'Studio'}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">View</p>
              <p className="mt-3 text-2xl font-display capitalize">{dataSource === 'fallback' ? 'Preview' : 'Live'}</p>
            </Card>
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Quick book</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] bg-brand-light/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-brand-dark/45">Walk-in</p>
                  <p className="mt-2 text-3xl font-display">{formatCurrency(walkInPrice)}</p>
                </div>
                <div className="text-right text-sm text-brand-dark/60">
                  <p>Standard {formatCurrency(service.standard_price)}</p>
                  <p>Member {formatCurrency(service.member_price ?? service.standard_price)}</p>
                </div>
              </div>
            </div>

            {service.has_home_service ? (
              <div className="rounded-[24px] bg-brand-secondary/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-brand-dark/45">Home service</p>
                    <p className="mt-2 text-3xl font-display">{formatCurrency(homePrice)}</p>
                  </div>
                  <div className="text-right text-sm text-brand-dark/60">
                    <p>Standard {formatCurrency(service.home_service_standard_price)}</p>
                    <p>
                      Member{' '}
                      {formatCurrency(
                        service.home_service_member_price ?? service.home_service_standard_price,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-[24px] bg-white/80 p-5 text-sm leading-6 text-brand-dark/65">
            Pick a slot, confirm your details, and pay. Home bookings ask for your address before checkout.
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={`/book/${service.id}`}>
              <Button>Book now</Button>
            </Link>
            <Link to="/services">
              <Button variant="secondary">Back to services</Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  )
}