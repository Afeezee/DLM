import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAdminAppointments } from '../../hooks/useAdminAppointments'
import { exportCSV } from '../../utils/exportCSV'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

export default function AdminAppointmentsPage() {
  const { appointments, error, isLoading, updateAppointmentStatus, updatingId } = useAdminAppointments()
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    serviceType: 'all',
    status: 'all',
  })

  const visibleAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const matchesStatus = filters.status === 'all' || appointment.status === filters.status
        const matchesType =
          filters.serviceType === 'all' || appointment.service_type === filters.serviceType
        const matchesFrom = !filters.dateFrom || appointment.date >= filters.dateFrom
        const matchesTo = !filters.dateTo || appointment.date <= filters.dateTo

        return matchesStatus && matchesType && matchesFrom && matchesTo
      }),
    [appointments, filters],
  )

  const columns = [
    { key: 'client', label: 'Client' },
    { key: 'service', label: 'Service' },
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'price', label: 'Price' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = visibleAppointments.map((appointment) => ({
    actions: (
      <div className="flex flex-wrap gap-2">
        {['confirmed', 'completed', 'cancelled'].map((nextStatus) => (
          <button
            key={nextStatus}
            type="button"
            className="rounded-full border border-brand-dark/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/70"
            disabled={appointment.status === nextStatus || updatingId === appointment.id}
            onClick={() => void updateAppointmentStatus(appointment.id, nextStatus)}
          >
            {nextStatus}
          </button>
        ))}
      </div>
    ),
    client: (
      <div>
        <p className="font-semibold text-brand-dark">{appointment.user?.name ?? 'Unknown user'}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{appointment.user?.email ?? 'No email'}</p>
      </div>
    ),
    date: (
      <div>
        <p>{formatDate(appointment.date)}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{appointment.time_slot}</p>
      </div>
    ),
    id: appointment.id,
    price: formatCurrency(appointment.price_paid ?? 0),
    service: appointment.service?.name ?? 'Service booking',
    status: <StatusBadge status={appointment.status} />,
    type: appointment.service_type,
  }))

  const exportRows = visibleAppointments.map((appointment) => ({
    client: appointment.user?.name ?? 'Unknown user',
    contact_email: appointment.user?.email ?? '',
    date: formatDate(appointment.date),
    price: Number(appointment.price_paid ?? 0),
    service: appointment.service?.name ?? 'Service booking',
    status: appointment.status,
    time_slot: appointment.time_slot,
    type: appointment.service_type,
  }))

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Admin</p>
          <h1 className="mt-2 text-4xl">Appointment manager</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
            Review incoming bookings, filter by type and date, and update status directly from the table.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => exportCSV(exportRows, 'dlm-appointments.csv')}
        >
          Export CSV
        </Button>
      </section>

      <Card className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
        <Input
          label="Date from"
          name="dateFrom"
          onChange={(event) =>
            setFilters((current) => ({ ...current, dateFrom: event.target.value }))
          }
          type="date"
          value={filters.dateFrom}
        />
        <Input
          label="Date to"
          name="dateTo"
          onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
          type="date"
          value={filters.dateTo}
        />
        <Select
          label="Service type"
          name="serviceType"
          onChange={(event) =>
            setFilters((current) => ({ ...current, serviceType: event.target.value }))
          }
          value={filters.serviceType}
        >
          <option value="all">All types</option>
          <option value="walk-in">Walk-in</option>
          <option value="home">Home service</option>
        </Select>
        <Select
          label="Status"
          name="status"
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          value={filters.status}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </Card>

      <Card className="p-6">
        {isLoading ? (
          <div className="surface h-56 animate-pulse bg-white/70" />
        ) : error ? (
          <p className="text-sm text-brand-accent">{error}</p>
        ) : rows.length ? (
          <Table columns={columns} rows={rows} />
        ) : (
          <p className="text-sm leading-6 text-brand-dark/65">
            No appointments match the current filters.
          </p>
        )}
      </Card>
    </div>
  )
}