import { useState } from 'react'
import { motion } from 'framer-motion'
import RevealText from '../components/shared/RevealText'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import ServiceCard from '../components/shared/ServiceCard'
import { useMembership } from '../hooks/useMembership'
import { useServices } from '../hooks/useServices'
import { getServiceImage } from '../lib/catalog-visuals'
import { getPricing } from '../lib/pricing'
import { formatCurrency } from '../utils/formatCurrency'

export default function ServicesPage() {
  const { categories, dataSource, error, isLoading, services } = useServices()
  const { isMember } = useMembership()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [serviceType, setServiceType] = useState('walk-in')

  const visibleServices = services.filter((service) => {
    const matchesCategory = activeCategory === 'all' || service.category_id === activeCategory
    const matchesSearch =
      searchTerm.trim() === '' ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesServiceType = serviceType === 'walk-in' || service.has_home_service

    return matchesCategory && matchesSearch && matchesServiceType
  })

  const showcaseServices = (visibleServices.length ? visibleServices : services).slice(0, 3)
  const homeReadyCount = visibleServices.filter((service) => service.has_home_service).length
  const startingPrice = visibleServices.length
    ? Math.min(...visibleServices.map((service) => getPricing(service, isMember, { serviceType })))
    : null

  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-start">
        <div>
          <Badge tone="accent">Book a service</Badge>
          <RevealText
            amount={0.2}
            as="h1"
            className="mt-5 max-w-4xl text-5xl leading-[0.93] text-gradient sm:text-6xl"
            text="Glow-ups, grooming, and home pamper sessions made easy."
          />
          <p className="mt-6 max-w-3xl text-lg leading-8 text-brand-dark/72">
            Pick a service, see the price, and book fast.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Mode</p>
              <p className="mt-3 text-2xl font-display">{serviceType === 'home' ? 'Home' : 'Walk-in'}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">From</p>
              <p className="mt-3 text-2xl font-display">
                {startingPrice === null ? 'Coming soon' : formatCurrency(startingPrice)}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Home-ready</p>
              <p className="mt-3 text-2xl font-display">{homeReadyCount}</p>
            </Card>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full bg-white/85 px-4 py-3 text-sm font-medium text-brand-dark/72 shadow-sm backdrop-blur-xl">
              {isMember ? 'Member prices are on' : 'Standard prices are on'}
            </div>
            <div className="rounded-full bg-brand-secondary/20 px-4 py-3 text-sm font-medium text-brand-dark/72">
              {dataSource === 'fallback' ? 'Preview catalogue' : 'Live catalogue'}
            </div>
          </div>
          {error ? (
            <div className="mt-5 rounded-[24px] bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent">
              {error}
            </div>
          ) : null}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          viewport={{ amount: 0.2, once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {showcaseServices.map((service, index) => (
              <Card
                key={service.id}
                className={[
                  'group relative overflow-hidden border-white/70 p-0',
                  index === 0 ? 'sm:col-span-2' : '',
                ].join(' ')}
              >
                <div className={index === 0 ? 'h-[340px]' : 'h-[220px]'}>
                  <img
                    alt={service.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    src={getServiceImage(service)}
                  />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,18,12,0.08),rgba(24,18,12,0.78))]" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-brand-light">
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-light/65">
                    {service.category?.name ?? 'Featured service'}
                  </p>
                  <p className="mt-2 text-3xl font-display">{service.name}</p>
                  <p className="mt-3 text-sm font-medium text-brand-light/78">
                    {formatCurrency(getPricing(service, isMember, { serviceType }))}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[300px_1fr]">
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.35 }}
          viewport={{ amount: 0.2, once: true }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <Card className="h-fit border-white/70 bg-white/75 p-6 backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Find a service</p>
            <div className="mt-4">
              <Input
                label="Search"
                name="search"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Makeup, grooming, spa..."
                value={searchTerm}
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Service type</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button
                className={serviceType === 'walk-in' ? '' : 'bg-white text-brand-dark hover:bg-brand-secondary/40'}
                onClick={() => setServiceType('walk-in')}
                type="button"
              >
                Walk-in
              </Button>
              <Button
                className={serviceType === 'home' ? '' : 'bg-white text-brand-dark hover:bg-brand-secondary/40'}
                onClick={() => setServiceType('home')}
                type="button"
              >
                Home service
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Categories</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                className={[
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  activeCategory === 'all'
                    ? 'bg-brand-dark text-brand-light'
                    : 'bg-brand-secondary/20 text-brand-dark hover:bg-brand-secondary/35',
                ].join(' ')}
                onClick={() => setActiveCategory('all')}
              >
                All categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={[
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    activeCategory === category.id
                      ? 'bg-brand-dark text-brand-light'
                      : 'bg-brand-secondary/20 text-brand-dark hover:bg-brand-secondary/35',
                  ].join(' ')}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          </Card>
        </motion.div>

        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Now showing</p>
              <h2 className="mt-2 text-3xl">
                {isLoading ? 'Loading services...' : `${visibleServices.length} services ready to book`}
              </h2>
            </div>
            <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-brand-dark/70 shadow-sm">
              {serviceType === 'home' ? 'Home-service pricing' : 'Walk-in pricing'} from{' '}
              {visibleServices.length
                ? formatCurrency(getPricing(visibleServices[0], isMember, { serviceType }))
                : formatCurrency(0)}
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="surface h-72 animate-pulse bg-white/70" />
              ))}
            </div>
          ) : visibleServices.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleServices.map((service, index) => {
                const price = getPricing(service, isMember, { serviceType })
                const details = service.description.split('.')[0]

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.28, delay: index * 0.04 }}
                  >
                    <ServiceCard
                      ctaLabel="View service"
                      description={details}
                      eyebrow={service.category?.name ?? 'Signature experience'}
                      imageUrl={getServiceImage(service)}
                      meta={`${service.duration_mins} mins • ${service.has_home_service ? 'Home or studio' : 'Studio only'}`}
                      memberPrice={
                        serviceType === 'home' && service.has_home_service
                          ? service.home_service_member_price
                          : service.member_price
                      }
                      price={price}
                      standardPrice={
                        serviceType === 'home' && service.has_home_service
                          ? service.home_service_standard_price
                          : service.standard_price
                      }
                      title={service.name}
                      to={`/services/${service.id}`}
                    />
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <Card className="mt-6 p-8">
              <h3 className="text-3xl">No matches yet</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-brand-dark/65">
                Try a broader keyword, switch back to all categories, or change the service type.
              </p>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}