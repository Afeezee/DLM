import { useMemo, useState } from 'react'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Toast from '../../components/ui/Toast'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAdminUsers } from '../../hooks/useAdminUsers'
import { formatDate } from '../../utils/formatDate'

function SummaryCard({ hint, label, value }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">{label}</p>
      <p className="mt-3 font-display text-4xl">{value}</p>
      <p className="mt-2 text-sm text-brand-dark/60">{hint}</p>
    </Card>
  )
}

export default function AdminUsersPage() {
  const { error, isLoading, updateUserRole, updatingId, users } = useAdminUsers()
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const summary = useMemo(
    () => ({
      admins: users.filter((user) => user.role === 'admin').length,
      members: users.filter((user) => user.membershipCount > 0).length,
      total: users.length,
      trainingParticipants: users.filter((user) => user.trainingCount > 0).length,
    }),
    [users],
  )

  const handleRoleUpdate = async (userId, role) => {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await updateUserRole(userId, role)
      setSuccessMessage('User role updated.')
    } catch (updateError) {
      setErrorMessage(updateError.message)
    }
  }

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'activity', label: 'Activity' },
    { key: 'role', label: 'Role' },
    { key: 'created', label: 'Joined' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = users.map((user) => ({
    actions: (
      <div className="flex flex-wrap gap-2">
        {['user', 'admin'].map((role) => (
          <button
            key={role}
            type="button"
            className="rounded-full border border-brand-dark/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/70"
            disabled={user.role === role || updatingId === user.id}
            onClick={() => void handleRoleUpdate(user.id, role)}
          >
            {role}
          </button>
        ))}
      </div>
    ),
    activity: (
      <div className="space-y-1 text-xs text-brand-dark/65">
        <p>Appointments: {user.appointmentCount}</p>
        <p>Orders: {user.orderCount}</p>
        <p>Active memberships: {user.membershipCount}</p>
        <p>Trainings: {user.trainingCount}</p>
      </div>
    ),
    created: formatDate(user.created_at),
    id: user.id,
    role: <StatusBadge status={user.role} />,
    user: (
      <div>
        <p className="font-semibold text-brand-dark">{user.name ?? 'Unnamed user'}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{user.email ?? 'No email'}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{user.phone ?? 'No phone'}</p>
      </div>
    ),
  }))

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Admin</p>
        <h1 className="mt-2 text-4xl">User management</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
          Review account activity, identify engaged members, and update access roles for operational users.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard hint="Total registered marketplace users" label="Users" value={summary.total} />
        <SummaryCard hint="Accounts with admin access" label="Admins" value={summary.admins} />
        <SummaryCard hint="Users with active memberships" label="Active members" value={summary.members} />
        <SummaryCard hint="Users enrolled in at least one training" label="Training participants" value={summary.trainingParticipants} />
      </section>

      <div className="space-y-3">
        <Toast message={error || errorMessage} tone="error" />
        <Toast message={successMessage} tone="success" />
      </div>

      <Card className="p-6">
        {isLoading ? <div className="surface h-56 animate-pulse bg-white/70" /> : <Table columns={columns} rows={rows} />}
      </Card>
    </div>
  )
}