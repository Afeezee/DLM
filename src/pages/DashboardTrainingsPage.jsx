import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import StatusBadge from '../components/shared/StatusBadge'
import { useTrainingRegistrations } from '../hooks/useTrainingRegistrations'
import { formatDate } from '../utils/formatDate'

export default function DashboardTrainingsPage() {
  const { error, isLoading, registrations } = useTrainingRegistrations()

  const columns = [
    { key: 'programme', label: 'Programme' },
    { key: 'registered', label: 'Registered' },
    { key: 'status', label: 'Status' },
  ]

  const rows = registrations.map((registration) => ({
    id: registration.id,
    programme: registration.programme_name,
    registered: formatDate(registration.registration_date),
    status: <StatusBadge status={registration.status} />,
  }))

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Member area</p>
        <h1 className="mt-2 text-4xl">My trainings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
          Keep track of the training programmes you have joined and the current progression status for each one.
        </p>
      </section>

      <Card className="p-6">
        {isLoading ? (
          <div className="surface h-48 animate-pulse bg-white/70" />
        ) : error ? (
          <p className="text-sm text-brand-accent">{error}</p>
        ) : rows.length ? (
          <Table columns={columns} rows={rows} />
        ) : (
          <p className="text-sm leading-6 text-brand-dark/65">
            You have not registered for any DLM trainings yet.
          </p>
        )}
      </Card>
    </div>
  )
}