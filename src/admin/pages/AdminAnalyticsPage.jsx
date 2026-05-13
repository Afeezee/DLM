import AdminStatCard from '../components/AdminStatCard'
import Card from '../../components/ui/Card'
import Toast from '../../components/ui/Toast'
import { useAdminAnalytics } from '../../hooks/useAdminAnalytics'
import { formatCurrency } from '../../utils/formatCurrency'

export default function AdminAnalyticsPage() {
  const { analytics, error, isLoading } = useAdminAnalytics()

  const stats = analytics
    ? [
        { hint: 'All marketplace accounts created so far', label: 'Users', value: analytics.totalUsers },
        { hint: 'Appointments still waiting on operational follow-up', label: 'Pending appointments', value: analytics.appointmentsPending },
        { hint: 'Active membership records', label: 'Active memberships', value: analytics.activeMemberships },
        { hint: 'Revenue from successful payment records', label: 'Recorded revenue', value: formatCurrency(analytics.monthlyRevenue) },
      ]
    : []

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Admin</p>
        <h1 className="mt-2 text-4xl">Analytics</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
          Review headline operational metrics across revenue, appointments, memberships, adverts, and training participation.
        </p>
      </section>

      <div className="space-y-3">
        <Toast message={error} tone="error" />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <div className="surface h-56 animate-pulse bg-white/70 md:col-span-2 xl:col-span-4" />
        ) : (
          stats.map((stat) => <AdminStatCard key={stat.label} {...stat} />)
        )}
      </section>

      {analytics ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Fashion revenue</p>
            <p className="mt-3 font-display text-4xl">{formatCurrency(analytics.fashionRevenue)}</p>
            <p className="mt-2 text-sm text-brand-dark/60">Sum of stored fashion order totals.</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Total appointments</p>
            <p className="mt-3 font-display text-4xl">{analytics.totalAppointments}</p>
            <p className="mt-2 text-sm text-brand-dark/60">All appointment records in the marketplace.</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Pending adverts</p>
            <p className="mt-3 font-display text-4xl">{analytics.advertsPending}</p>
            <p className="mt-2 text-sm text-brand-dark/60">Submissions awaiting review or decision.</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Training registrations</p>
            <p className="mt-3 font-display text-4xl">{analytics.totalTrainings}</p>
            <p className="mt-2 text-sm text-brand-dark/60">Total free programme registrations recorded.</p>
          </Card>
        </section>
      ) : null}
    </div>
  )
}