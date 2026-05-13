import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import StatusBadge from '../components/shared/StatusBadge'
import { useMembershipHistory } from '../hooks/useMembershipHistory'
import { useMembership } from '../hooks/useMembership'
import { formatDate } from '../utils/formatDate'

export default function DashboardMembershipPage() {
  const { activeMembership, isMember, isLoading: membershipLoading } = useMembership()
  const { error, history, isLoading } = useMembershipHistory()

  const columns = [
    { key: 'plan', label: 'Plan' },
    { key: 'period', label: 'Period' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Created' },
  ]

  const rows = history.map((membership) => ({
    created: formatDate(membership.created_at),
    id: membership.id,
    period: `${formatDate(membership.start_date)} - ${formatDate(membership.end_date)}`,
    plan: membership.plan,
    status: <StatusBadge status={membership.status} />,
  }))

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Member area</p>
          <h1 className="mt-2 text-4xl">Membership</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
            Review your active plan, previous renewals, and how server-side pricing validation is applied to your account.
          </p>
        </div>
        <Link to="/services">
          <Button>Use member pricing</Button>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Current status</p>
          <p className="mt-3 font-display text-4xl">{membershipLoading ? '...' : isMember ? 'Active' : 'Standard'}</p>
          <p className="mt-2 text-sm text-brand-dark/60">Active memberships unlock subsidised platform pricing.</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Plan</p>
          <p className="mt-3 font-display text-4xl">{activeMembership?.plan ?? 'Monthly'}</p>
          <p className="mt-2 text-sm text-brand-dark/60">Membership billing integration is prepared for recurring Paystack flows.</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Current period</p>
          <p className="mt-3 font-display text-2xl">
            {activeMembership ? formatDate(activeMembership.start_date) : 'Not active'}
          </p>
          <p className="mt-2 text-sm text-brand-dark/60">
            {activeMembership ? `Ends ${formatDate(activeMembership.end_date)}` : 'Activate membership to begin a pricing period.'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">History count</p>
          <p className="mt-3 font-display text-4xl">{isLoading ? '...' : history.length}</p>
          <p className="mt-2 text-sm text-brand-dark/60">All previous grants, renewals, and status changes recorded on your account.</p>
        </Card>
      </section>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl">Membership history</h2>
            <p className="mt-2 text-sm text-brand-dark/60">Each membership lifecycle entry stored in Supabase.</p>
          </div>
        </div>
        {error ? (
          <p className="text-sm text-brand-accent">{error}</p>
        ) : rows.length ? (
          <Table columns={columns} rows={rows} />
        ) : (
          <p className="text-sm leading-6 text-brand-dark/65">No membership records are available for this account yet.</p>
        )}
      </Card>
    </div>
  )
}