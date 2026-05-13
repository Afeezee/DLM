import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import StatusBadge from '../components/shared/StatusBadge'
import { useAuth } from '../hooks/useAuth'
import { useMembership } from '../hooks/useMembership'
import { useUserAppointments } from '../hooks/useUserAppointments'
import { useUserFashionOrders } from '../hooks/useUserFashionOrders'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

function SummaryCard({ hint, label, value }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">{label}</p>
      <p className="mt-3 font-display text-4xl">{value}</p>
      <p className="mt-2 text-sm text-brand-dark/60">{hint}</p>
    </Card>
  )
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const { activeMembership, isMember } = useMembership()
  const { appointments, error: appointmentsError, isLoading: appointmentsLoading } =
    useUserAppointments()
  const { error: ordersError, isLoading: ordersLoading, orders } = useUserFashionOrders()

  const recentAppointments = appointments.slice(0, 4)
  const recentOrders = orders.slice(0, 3)
  const totalSpend =
    appointments.reduce((total, appointment) => total + Number(appointment.price_paid ?? 0), 0) +
    orders.reduce((total, order) => total + Number(order.total_amount ?? 0), 0)
  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'pending').length
  const upcomingAppointments = appointments.filter((appointment) =>
    ['pending', 'confirmed'].includes(String(appointment.status)),
  ).length

  const appointmentColumns = [
    { key: 'service', label: 'Service' },
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
  ]

  const appointmentRows = recentAppointments.map((appointment) => ({
    id: appointment.id,
    date: formatDate(appointment.date),
    service: appointment.service?.name ?? 'Service booking',
    status: <StatusBadge status={appointment.status} />,
    type: appointment.service_type,
  }))

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Member dashboard</p>
          <h1 className="mt-2 text-4xl">Welcome back, {profile?.name?.split(' ')[0] ?? 'Member'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
            Track your bookings, orders, and membership state from one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/services">
            <Button>Book a service</Button>
          </Link>
          <Link to="/fashion">
            <Button variant="secondary">Shop fashion</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          hint="Pending and confirmed requests awaiting fulfilment"
          label="Upcoming appointments"
          value={appointmentsLoading ? '...' : String(upcomingAppointments)}
        />
        <SummaryCard
          hint="Requests that may need follow-up from the DLM coordinator"
          label="Pending appointments"
          value={appointmentsLoading ? '...' : String(pendingAppointments)}
        />
        <SummaryCard
          hint="Combined appointment and fashion spend recorded on your account"
          label="Total recorded spend"
          value={appointmentsLoading || ordersLoading ? '...' : formatCurrency(totalSpend)}
        />
        <SummaryCard
          hint={
            activeMembership
              ? `Active until ${formatDate(activeMembership.end_date)}`
              : 'Activate membership to unlock subsidised pricing'
          }
          label="Membership status"
          value={isMember ? 'Active' : 'Standard'}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl">Recent appointments</h2>
              <p className="mt-2 text-sm text-brand-dark/60">Your latest booking requests and service statuses.</p>
            </div>
            <Link to="/dashboard/appointments">
              <Button variant="secondary">View all</Button>
            </Link>
          </div>

          <div className="mt-5">
            {appointmentsError ? (
              <p className="text-sm text-brand-accent">{appointmentsError}</p>
            ) : appointmentRows.length ? (
              <Table columns={appointmentColumns} rows={appointmentRows} />
            ) : (
              <p className="text-sm leading-6 text-brand-dark/65">
                No appointments have been recorded on this account yet.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl">Recent fashion orders</h2>
              <p className="mt-2 text-sm text-brand-dark/60">Your latest checkout activity and delivery status.</p>
            </div>
            <Link to="/dashboard/orders">
              <Button variant="secondary">View all</Button>
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {ordersError ? (
              <p className="text-sm text-brand-accent">{ordersError}</p>
            ) : recentOrders.length ? (
              recentOrders.map((order) => (
                <div key={order.id} className="rounded-[24px] bg-brand-light/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-brand-dark">
                        Order placed {formatDate(order.created_at)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-brand-dark/65">
                        {(order.items ?? [])
                          .slice(0, 2)
                          .map((item) => `${item.name} x ${item.qty}`)
                          .join(', ') || 'Fashion order'}
                      </p>
                    </div>
                    <StatusBadge status={order.delivery_status} />
                  </div>
                  <p className="mt-3 text-lg font-semibold text-brand-dark">
                    {formatCurrency(order.total_amount ?? 0)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-brand-dark/65">
                No fashion orders have been recorded on this account yet.
              </p>
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}