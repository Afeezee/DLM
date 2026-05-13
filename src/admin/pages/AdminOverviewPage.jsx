import { Link } from 'react-router-dom'
import AdminStatCard from '../components/AdminStatCard'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAdminAnalytics } from '../../hooks/useAdminAnalytics'
import { useAdminAppointments } from '../../hooks/useAdminAppointments'
import { formatCurrency } from '../../utils/formatCurrency'

export default function AdminOverviewPage() {
  const { analytics } = useAdminAnalytics()
  const { appointments } = useAdminAppointments()

  const stats = analytics
    ? [
        {
          hint: `${analytics.appointmentsPending} pending confirmation`,
          label: 'Appointments',
          value: analytics.totalAppointments,
        },
        {
          hint: 'Users receiving active member pricing',
          label: 'Active memberships',
          value: analytics.activeMemberships,
        },
        {
          hint: 'Successful payments captured across the marketplace',
          label: 'Recorded revenue',
          value: formatCurrency(analytics.monthlyRevenue),
        },
        {
          hint: 'Advert requests awaiting the admin team',
          label: 'Pending adverts',
          value: analytics.advertsPending,
        },
      ]
    : []

  const columns = [
    { key: 'service', label: 'Service' },
    { key: 'client', label: 'Client' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
  ]

  const rows = appointments.slice(0, 5).map((appointment) => ({
    client: appointment.user?.name ?? 'Unknown user',
    id: appointment.id,
    service: appointment.service?.name ?? 'Service unavailable',
    status: <StatusBadge status={appointment.status} />,
    type: appointment.service_type,
  }))

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Overview</p>
          <h2 className="mt-2 text-4xl">Operations at a glance</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
            Live metrics from appointments, memberships, adverts, and payments are surfaced here for quick daily review.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/services"><Button>Add service</Button></Link>
          <Link to="/admin/fashion"><Button variant="secondary">Add product</Button></Link>
          <Link to="/admin/announcements"><Button variant="secondary">Create announcement</Button></Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <AdminStatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-3xl">Recent appointments</h3>
          <p className="mt-2 text-sm text-brand-dark/60">Most recent booking activity from the live appointment manager.</p>
        </div>
        <Table columns={columns} rows={rows} />
      </section>
    </div>
  )
}