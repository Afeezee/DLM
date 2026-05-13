import { useState } from 'react'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import StatusBadge from '../components/shared/StatusBadge'
import { useUserAppointments } from '../hooks/useUserAppointments'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

const statuses = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function DashboardAppointmentsPage() {
  const { appointments, error, isLoading } = useUserAppointments()
  const [statusFilter, setStatusFilter] = useState('all')

  const visibleAppointments = appointments.filter((appointment) =>
    statusFilter === 'all' ? true : appointment.status === statusFilter,
  )

  const columns = [
    { key: 'service', label: 'Service' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'price', label: 'Price' },
  ]

  const rows = visibleAppointments.map((appointment) => ({
    id: appointment.id,
    date: formatDate(appointment.date),
    price: formatCurrency(appointment.price_paid ?? 0),
    service: appointment.service?.name ?? 'Service booking',
    status: <StatusBadge status={appointment.status} />,
    time: appointment.time_slot,
    type: appointment.service_type,
  }))

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Member area</p>
        <h1 className="mt-2 text-4xl">My appointments</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
          Review your appointment history, pricing, and fulfilment status.
        </p>
      </section>

      <Card className="p-6">
        <div className="flex flex-wrap gap-3">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                statusFilter === status
                  ? 'bg-brand-dark text-brand-light'
                  : 'bg-brand-secondary/20 text-brand-dark hover:bg-brand-secondary/35',
              ].join(' ')}
              onClick={() => setStatusFilter(status)}
            >
              {status.replaceAll('-', ' ')}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        {isLoading ? (
          <div className="surface h-48 animate-pulse bg-white/70" />
        ) : error ? (
          <p className="text-sm text-brand-accent">{error}</p>
        ) : rows.length ? (
          <Table columns={columns} rows={rows} />
        ) : (
          <p className="text-sm leading-6 text-brand-dark/65">
            No appointments match this filter yet.
          </p>
        )}
      </Card>
    </div>
  )
}