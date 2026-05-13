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
import { getPricing } from '../lib/pricing'
import { formatCurrency } from '../utils/formatCurrency'

export default function ServicesPage() {
  const { categories, dataSource, error, isLoading, services } = useServices()
  const { activeMembership, isMember } = useMembership()
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

  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <Badge tone="accent">Services catalogue</Badge>
          <RevealText
            amount={0.2}
            as="h1"
            className="mt-5 max-w-4xl text-5xl leading-[0.93] text-gradient sm:text-6xl"
            text="Browse studio and home-service experiences with pricing that respects membership status."
          />
          <p className="mt-6 max-w-3xl text-lg leading-8 text-brand-dark/72">
            This catalogue reads from Supabase when configured and falls back to preview data in development, so the booking and pricing journey can move forward without blocking the UI.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          viewport={{ amount: 0.2, once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <Card className="grid gap-4 border-white/70 bg-white/80 p-6 backdrop-blur-xl sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Pricing mode</p>
            <p className="mt-3 text-3xl font-display">
              {isMember ? 'Member pricing active' : 'Standard pricing active'}
            </p>
            <p className="mt-2 text-sm leading-6 text-brand-dark/65">
              {activeMembership
                ? 'Your active membership is applied automatically across member-aware price displays.'
                : 'Sign in with an active membership to see subsidised pricing reflected throughout the catalogue.'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Data source</p>
            <p className="mt-3 text-3xl font-display capitalize">{dataSource}</p>
            <p className="mt-2 text-sm leading-6 text-brand-dark/65">
              {dataSource === 'supabase'
                ? 'Live catalogue records are being rendered from your database.'
                : 'Preview catalogue records are being used until Supabase services are available.'}
            </p>
          </div>
          {error ? (
            <div className="sm:col-span-2 rounded-[24px] bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent">
              {error}
            </div>
          ) : null}
          </Card>
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
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Catalogue results</p>
              <h2 className="mt-2 text-3xl">
                {isLoading ? 'Loading services...' : `${visibleServices.length} services available`}
              </h2>
            </div>
            <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-brand-dark/70 shadow-sm">
              Displaying {serviceType === 'home' ? 'home-service' : 'walk-in'} pricing from{' '}
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
                const details = [
                  service.description,
                  `${service.duration_mins} mins`,
                  service.has_home_service ? 'Home service available' : 'Studio only',
                ].join(' ')

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
              <h3 className="text-3xl">No services match this filter</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-brand-dark/65">
                Try a broader keyword, switch back to all categories, or change the service type to see more results.
              </p>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}