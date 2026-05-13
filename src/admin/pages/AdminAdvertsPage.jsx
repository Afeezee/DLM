import { useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Textarea from '../../components/ui/Textarea'
import Toast from '../../components/ui/Toast'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAdminAdverts } from '../../hooks/useAdminAdverts'
import { exportCSV } from '../../utils/exportCSV'
import { formatDate } from '../../utils/formatDate'

export default function AdminAdvertsPage() {
  const { adverts, error, isLoading, updateAdvert, updatingId } = useAdminAdverts()
  const [notes, setNotes] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleStatusUpdate = async (advertId, status) => {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await updateAdvert(advertId, { status })
      setSuccessMessage('Advert status updated.')
    } catch (updateError) {
      setErrorMessage(updateError.message)
    }
  }

  const handleNoteSave = async (advert) => {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await updateAdvert(advert.id, {
        admin_notes: notes[advert.id] ?? advert.admin_notes ?? '',
      })
      setSuccessMessage('Admin note saved.')
    } catch (updateError) {
      setErrorMessage(updateError.message)
    }
  }

  const columns = [
    { key: 'business', label: 'Business' },
    { key: 'contact', label: 'Contact' },
    { key: 'duration', label: 'Duration' },
    { key: 'status', label: 'Status' },
    { key: 'notes', label: 'Admin note' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = adverts.map((advert) => ({
    actions: (
      <div className="flex flex-wrap gap-2">
        {['reviewed', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            type="button"
            className="rounded-full border border-brand-dark/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/70"
            disabled={advert.status === status || updatingId === advert.id}
            onClick={() => void handleStatusUpdate(advert.id, status)}
          >
            {status}
          </button>
        ))}
      </div>
    ),
    business: (
      <div>
        <p className="font-semibold text-brand-dark">{advert.business_name}</p>
        <p className="mt-1 text-xs text-brand-dark/55">Submitted {formatDate(advert.created_at)}</p>
      </div>
    ),
    contact: (
      <div>
        <p className="font-semibold text-brand-dark">{advert.contact_name}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{advert.email}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{advert.phone}</p>
      </div>
    ),
    duration: advert.preferred_duration,
    id: advert.id,
    notes: (
      <div className="space-y-2">
        <Textarea
          className="min-h-24"
          onChange={(event) => setNotes((current) => ({ ...current, [advert.id]: event.target.value }))}
          value={notes[advert.id] ?? advert.admin_notes ?? ''}
        />
        <Button disabled={updatingId === advert.id} onClick={() => void handleNoteSave(advert)} variant="secondary">
          Save note
        </Button>
      </div>
    ),
    status: <StatusBadge status={advert.status} />,
  }))

  const exportRows = adverts.map((advert) => ({
    business_name: advert.business_name,
    contact_name: advert.contact_name,
    created_at: formatDate(advert.created_at),
    email: advert.email,
    preferred_duration: advert.preferred_duration,
    status: advert.status,
  }))

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Admin</p>
          <h1 className="mt-2 text-4xl">Advert management</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
            Review advertiser requests, keep decision notes, and move submissions through approval states.
          </p>
        </div>
        <Button variant="secondary" onClick={() => exportCSV(exportRows, 'dlm-adverts.csv')}>
          Export CSV
        </Button>
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