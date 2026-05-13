import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Toast from '../../components/ui/Toast'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAdminTrainingRegistrations } from '../../hooks/useAdminTrainingRegistrations'
import { exportCSV } from '../../utils/exportCSV'
import { formatDate } from '../../utils/formatDate'

export default function AdminTrainingsPage() {
  const { error, isLoading, registrations, updateRegistrationStatus, updatingId } =
    useAdminTrainingRegistrations()
  const [programmeFilter, setProgrammeFilter] = useState('all')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const programmes = useMemo(
    () => [...new Set(registrations.map((registration) => registration.programme_name).filter(Boolean))],
    [registrations],
  )

  const visibleRegistrations = registrations.filter((registration) =>
    programmeFilter === 'all' ? true : registration.programme_name === programmeFilter,
  )

  const handleStatusUpdate = async (registrationId, status) => {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await updateRegistrationStatus(registrationId, status)
      setSuccessMessage('Training status updated.')
    } catch (updateError) {
      setErrorMessage(updateError.message)
    }
  }

  const columns = [
    { key: 'participant', label: 'Participant' },
    { key: 'programme', label: 'Programme' },
    { key: 'registered', label: 'Registered' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = visibleRegistrations.map((registration) => ({
    actions: (
      <div className="flex flex-wrap gap-2">
        {['registered', 'confirmed', 'attended'].map((nextStatus) => (
          <button
            key={nextStatus}
            type="button"
            className="rounded-full border border-brand-dark/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/70"
            disabled={registration.status === nextStatus || updatingId === registration.id}
            onClick={() => void handleStatusUpdate(registration.id, nextStatus)}
          >
            {nextStatus}
          </button>
        ))}
      </div>
    ),
    id: registration.id,
    participant: (
      <div>
        <p className="font-semibold text-brand-dark">{registration.user?.name ?? 'Unknown user'}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{registration.user?.email ?? 'No email'}</p>
      </div>
    ),
    programme: registration.programme_name,
    registered: formatDate(registration.registration_date),
    status: <StatusBadge status={registration.status} />,
  }))

  const exportRows = visibleRegistrations.map((registration) => ({
    participant: registration.user?.name ?? 'Unknown user',
    programme: registration.programme_name,
    registration_date: formatDate(registration.registration_date),
    status: registration.status,
  }))

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Admin</p>
          <h1 className="mt-2 text-4xl">Training management</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
            Track registrations by programme and move each participant through confirmation and attendance states.
          </p>
        </div>
        <Button variant="secondary" onClick={() => exportCSV(exportRows, 'dlm-trainings.csv')}>
          Export CSV
        </Button>
      </section>

      <Card className="p-6">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              programmeFilter === 'all'
                ? 'bg-brand-dark text-brand-light'
                : 'bg-brand-secondary/20 text-brand-dark hover:bg-brand-secondary/35',
            ].join(' ')}
            onClick={() => setProgrammeFilter('all')}
          >
            All programmes
          </button>
          {programmes.map((programme) => (
            <button
              key={programme}
              type="button"
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                programmeFilter === programme
                  ? 'bg-brand-dark text-brand-light'
                  : 'bg-brand-secondary/20 text-brand-dark hover:bg-brand-secondary/35',
              ].join(' ')}
              onClick={() => setProgrammeFilter(programme)}
            >
              {programme}
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <Toast message={error || errorMessage} tone="error" />
        <Toast message={successMessage} tone="success" />
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="surface h-56 animate-pulse bg-white/70" />
        ) : rows.length ? (
          <Table columns={columns} rows={rows} />
        ) : (
          <p className="text-sm leading-6 text-brand-dark/65">
            No training registrations match the current filter.
          </p>
        )}
      </Card>
    </div>
  )
}