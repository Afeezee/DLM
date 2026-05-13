import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'
import Toast from '../../components/ui/Toast'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAdminMemberships } from '../../hooks/useAdminMemberships'
import { formatDate } from '../../utils/formatDate'

const defaultStartDate = new Date().toISOString().slice(0, 10)

function SummaryCard({ hint, label, value }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">{label}</p>
      <p className="mt-3 font-display text-4xl">{value}</p>
      <p className="mt-2 text-sm text-brand-dark/60">{hint}</p>
    </Card>
  )
}

export default function AdminMembershipsPage() {
  const {
    error,
    grantMembership,
    isLoading,
    memberships,
    updateMembershipStatus,
    updatingId,
    users,
  } = useAdminMemberships()
  const [form, setForm] = useState({
    endDate: '',
    plan: 'monthly',
    startDate: defaultStartDate,
    status: 'active',
    userId: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const counts = useMemo(
    () => ({
      active: memberships.filter((membership) => membership.status === 'active').length,
      cancelled: memberships.filter((membership) => membership.status === 'cancelled').length,
      expired: memberships.filter((membership) => membership.status === 'expired').length,
    }),
    [memberships],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleGrantMembership = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!form.userId || !form.startDate || !form.endDate) {
      setErrorMessage('Choose a user and membership period before granting access.')
      return
    }

    try {
      await grantMembership(form)
      setSuccessMessage('Membership granted successfully.')
      setForm((current) => ({
        ...current,
        endDate: '',
        userId: '',
      }))
    } catch (grantError) {
      setErrorMessage(grantError.message)
    }
  }

  const columns = [
    { key: 'member', label: 'Member' },
    { key: 'plan', label: 'Plan' },
    { key: 'period', label: 'Period' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = memberships.map((membership) => ({
    actions: (
      <div className="flex flex-wrap gap-2">
        {['active', 'expired', 'cancelled'].map((nextStatus) => (
          <button
            key={nextStatus}
            type="button"
            className="rounded-full border border-brand-dark/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/70"
            disabled={membership.status === nextStatus || updatingId === membership.id}
            onClick={() => void updateMembershipStatus(membership.id, nextStatus)}
          >
            {nextStatus}
          </button>
        ))}
      </div>
    ),
    id: membership.id,
    member: (
      <div>
        <p className="font-semibold text-brand-dark">{membership.user?.name ?? 'Unknown user'}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{membership.user?.email ?? 'No email'}</p>
      </div>
    ),
    period: `${formatDate(membership.start_date)} - ${formatDate(membership.end_date)}`,
    plan: membership.plan,
    status: <StatusBadge status={membership.status} />,
  }))

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Admin</p>
        <h1 className="mt-2 text-4xl">Membership management</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
          Grant memberships manually, review current lifecycle states, and update member status when needed.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard hint="Members currently receiving subsidised pricing" label="Active" value={counts.active} />
        <SummaryCard hint="Memberships that ended without renewal" label="Expired" value={counts.expired} />
        <SummaryCard hint="Memberships manually or system cancelled" label="Cancelled" value={counts.cancelled} />
      </section>

      <Card className="p-6">
        <h2 className="text-3xl">Manual membership grant</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={handleGrantMembership}>
          <Select label="User" name="userId" onChange={handleChange} value={form.userId}>
            <option value="">Select user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </Select>
          <Select label="Plan" name="plan" onChange={handleChange} value={form.plan}>
            <option value="monthly">Monthly</option>
          </Select>
          <Select label="Status" name="status" onChange={handleChange} value={form.status}>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-dark">Start date</span>
            <input
              className="h-12 w-full rounded-2xl border border-brand-dark/10 bg-white px-4"
              name="startDate"
              onChange={handleChange}
              type="date"
              value={form.startDate}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-dark">End date</span>
            <input
              className="h-12 w-full rounded-2xl border border-brand-dark/10 bg-white px-4"
              name="endDate"
              onChange={handleChange}
              type="date"
              value={form.endDate}
            />
          </label>
          <div className="md:col-span-2 xl:col-span-5">
            <Button disabled={Boolean(updatingId)} type="submit">
              Grant membership
            </Button>
          </div>
        </form>

        <div className="mt-4 space-y-3">
          <Toast message={error || errorMessage} tone="error" />
          <Toast message={successMessage} tone="success" />
        </div>
      </Card>

      <Card className="p-6">
        {isLoading ? (
          <div className="surface h-56 animate-pulse bg-white/70" />
        ) : rows.length ? (
          <Table columns={columns} rows={rows} />
        ) : (
          <p className="text-sm leading-6 text-brand-dark/65">No memberships have been recorded yet.</p>
        )}
      </Card>
    </div>
  )
}