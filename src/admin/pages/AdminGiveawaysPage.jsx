import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Toast from '../../components/ui/Toast'
import { useAdminGiveaways } from '../../hooks/useAdminGiveaways'
import { exportCSV } from '../../utils/exportCSV'
import { formatDate } from '../../utils/formatDate'

export default function AdminGiveawaysPage() {
  const { entries, error, isLoading, publishWinnerAnnouncement, updatingId } = useAdminGiveaways()
  const [monthFilter, setMonthFilter] = useState('all')
  const [selectedWinner, setSelectedWinner] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const months = useMemo(() => [...new Set(entries.map((entry) => entry.month).filter(Boolean))], [entries])

  const visibleEntries = useMemo(
    () => entries.filter((entry) => (monthFilter === 'all' ? true : entry.month === monthFilter)),
    [entries, monthFilter],
  )

  const handlePickWinner = () => {
    if (!visibleEntries.length) {
      setSelectedWinner(null)
      return
    }

    const nextWinner = visibleEntries[Math.floor(Math.random() * visibleEntries.length)]
    setSelectedWinner(nextWinner)
    setSuccessMessage(`Selected ${nextWinner.user?.name ?? 'a participant'} as the provisional winner.`)
  }

  const handlePublishWinner = async () => {
    if (!selectedWinner) {
      return
    }

    setErrorMessage('')

    try {
      await publishWinnerAnnouncement(selectedWinner, selectedWinner.month)
      setSuccessMessage('Winner announcement published to the community feed.')
    } catch (publishError) {
      setErrorMessage(publishError.message)
    }
  }

  const columns = [
    { key: 'participant', label: 'Participant' },
    { key: 'month', label: 'Month' },
    { key: 'entered', label: 'Entered' },
  ]

  const rows = visibleEntries.map((entry) => ({
    entered: formatDate(entry.entry_date),
    id: entry.id,
    month: entry.month,
    participant: (
      <div>
        <p className="font-semibold text-brand-dark">{entry.user?.name ?? 'Unknown user'}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{entry.user?.email ?? 'No email'}</p>
      </div>
    ),
  }))

  const exportRows = visibleEntries.map((entry) => ({
    email: entry.user?.email ?? '',
    entry_date: formatDate(entry.entry_date),
    month: entry.month,
    participant: entry.user?.name ?? 'Unknown user',
  }))

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Admin</p>
          <h1 className="mt-2 text-4xl">Giveaway management</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
            Review monthly entries, pick a provisional winner, and publish the result to the community feed.
          </p>
        </div>
        <Button variant="secondary" onClick={() => exportCSV(exportRows, 'dlm-giveaways.csv')}>
          Export CSV
        </Button>
      </section>

      <Card className="p-6">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              monthFilter === 'all'
                ? 'bg-brand-dark text-brand-light'
                : 'bg-brand-secondary/20 text-brand-dark hover:bg-brand-secondary/35',
            ].join(' ')}
            onClick={() => setMonthFilter('all')}
          >
            All months
          </button>
          {months.map((month) => (
            <button
              key={month}
              type="button"
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                monthFilter === month
                  ? 'bg-brand-dark text-brand-light'
                  : 'bg-brand-secondary/20 text-brand-dark hover:bg-brand-secondary/35',
              ].join(' ')}
              onClick={() => setMonthFilter(month)}
            >
              {month}
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <Toast message={error || errorMessage} tone="error" />
        <Toast message={successMessage} tone="success" />
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl">Random winner selection</h2>
            <p className="mt-2 text-sm text-brand-dark/60">
              {selectedWinner
                ? `${selectedWinner.user?.name ?? 'Unknown user'} is currently selected for ${selectedWinner.month}.`
                : 'Pick a month-specific winner from the current filter.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handlePickWinner} variant="secondary">Pick winner</Button>
            <Button disabled={!selectedWinner || updatingId === selectedWinner?.id} onClick={() => void handlePublishWinner()}>
              Publish winner
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {isLoading ? <div className="surface h-56 animate-pulse bg-white/70" /> : <Table columns={columns} rows={rows} />}
      </Card>
    </div>
  )
}