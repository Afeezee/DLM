import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import RevealText from '../components/shared/RevealText'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ServiceCard from '../components/shared/ServiceCard'
import { useMembership } from '../hooks/useMembership'
import { useServices } from '../hooks/useServices'
import { getPricing } from '../lib/pricing'
import { formatCurrency } from '../utils/formatCurrency'

const benefits = [
  '₦1,000 monthly membership for subsidised prices across services and products',
  'Walk-in and home-service experiences coordinated end-to-end by the DLM team',
  'One platform for bookings, fashion shopping, trainings, adverts, and community programmes',
]

export default function LandingPage() {
  const { isMember } = useMembership()
  const { services } = useServices()

  const previewServices = services.slice(0, 3)

  return (
    <div>
      <section className="shell grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Badge tone="accent">Luxury beauty, fashion, and lifestyle</Badge>
          </motion.div>
          <RevealText
            amount={0.2}
            as="h1"
            className="mt-6 max-w-4xl text-5xl leading-[0.93] text-gradient sm:text-6xl lg:text-7xl"
            once
            text="Premium experiences with member pricing designed for modern Nigeria."
          />
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-6 max-w-2xl text-lg leading-8 text-brand-dark/72"
          >
            Denomis Luxury Marketplace brings beauty services, curated fashion, community programmes, and personal growth into one refined digital experience.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link to="/register">
              <Button size="lg">Become a member</Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="secondary">
                Explore services
              </Button>
            </Link>
          </motion.div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 18 }}
                transition={{ delay: index * 0.08, duration: 0.34 }}
                viewport={{ amount: 0.25, once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Card className="border-white/70 bg-white/80 p-5 backdrop-blur-xl">
                  <p className="text-sm leading-6 text-brand-dark/68">{benefit}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="surface relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.78),transparent_28%),linear-gradient(145deg,rgba(255,247,238,0.88),rgba(246,234,223,0.94))] p-8 sm:p-10"
        >
          <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-brand-accent/10 blur-2xl" />
          <div className="absolute bottom-10 left-10 h-24 w-24 rounded-full bg-brand-primary/20 blur-2xl" />
          <p className="text-xs uppercase tracking-[0.3em] text-brand-dark/45">Membership spotlight</p>
          <h2 className="mt-6 max-w-sm text-4xl leading-none sm:text-5xl">Save more across every DLM touchpoint.</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-brand-dark/68">
            Members unlock subsidised service prices, lower fashion costs, and priority access across the marketplace for just {formatCurrency(1000)} monthly.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card className="border-brand-dark/6 bg-white/70 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Member fee</p>
              <p className="mt-3 font-display text-5xl">₦1,000</p>
              <p className="mt-2 text-sm text-brand-dark/62">Monthly access to subsidised pricing</p>
            </Card>
            <Card className="border-brand-dark/6 bg-brand-dark p-5 text-brand-light">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-light/60">Home service</p>
              <p className="mt-3 font-display text-4xl text-brand-light">Premium on demand</p>
              <p className="mt-2 text-sm leading-6 text-brand-light/72">Studio visits or home appointments, priced automatically by membership status.</p>
            </Card>
          </div>
        </motion.div>
      </section>

      <section className="shell py-8 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-primary">Service categories</p>
            <RevealText
              amount={0.25}
              as="h2"
              className="mt-4 section-heading"
              text="Everything DLM coordinates in one place."
            />
          </div>
          <p className="max-w-xl section-copy">
            Featured previews below are pulled from the current service catalogue, so the landing experience stays aligned with the live booking inventory.
          </p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {previewServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <ServiceCard
                ctaLabel="Explore service"
                description={service.description}
                eyebrow={service.category?.name ?? 'Featured service'}
                memberPrice={service.member_price}
                price={getPricing(service, isMember)}
                standardPrice={service.standard_price}
                title={service.name}
                to={`/services/${service.id}`}
              />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="shell py-12 sm:py-16">
        <Card className="grid gap-8 bg-[linear-gradient(135deg,rgba(36,27,18,0.98),rgba(86,57,32,0.94))] p-8 text-brand-light sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-light/55">Membership call to action</p>
            <RevealText
              amount={0.3}
              as="h2"
              className="mt-4 text-4xl text-brand-light sm:text-5xl"
              text="Join once. Book smarter. Shop better."
            />
            <p className="mt-5 max-w-2xl text-base leading-7 text-brand-light/72">
              Register now to start with a DLM profile, track future bookings, and prepare for member billing, fashion checkout, and training registrations.
            </p>
          </div>
          <Link to="/register">
            <Button size="lg" variant="light">
              Create your account
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  )
}