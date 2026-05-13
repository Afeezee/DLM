import { useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'
import Textarea from '../../components/ui/Textarea'
import Toast from '../../components/ui/Toast'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAdminAnnouncements } from '../../hooks/useAdminAnnouncements'
import { formatDate } from '../../utils/formatDate'

const initialForm = {
  body: '',
  category: 'general',
  imageUrl: '',
  isPublished: true,
  title: '',
}

export default function AdminAnnouncementsPage() {
  const { announcements, createAnnouncement, error, isLoading, updateAnnouncement, updatingId } =
    useAdminAnnouncements()
  const [form, setForm] = useState(initialForm)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await createAnnouncement(form)
      setForm(initialForm)
      setSuccessMessage('Announcement created.')
    } catch (createError) {
      setErrorMessage(createError.message)
    }
  }

  const handleTogglePublish = async (announcement) => {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await updateAnnouncement(announcement.id, {
        is_published: !announcement.is_published,
        published_at: announcement.published_at,
      })
      setSuccessMessage('Announcement status updated.')
    } catch (updateError) {
      setErrorMessage(updateError.message)
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
    { key: 'published', label: 'Published' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = announcements.map((announcement) => ({
    actions: (
      <Button
        disabled={updatingId === announcement.id}
        onClick={() => void handleTogglePublish(announcement)}
        variant="secondary"
      >
        {announcement.is_published ? 'Unpublish' : 'Publish'}
      </Button>
    ),
    category: String(announcement.category ?? 'general').replaceAll('-', ' '),
    id: announcement.id,
    published: formatDate(announcement.published_at || announcement.created_at),
    status: (
      <StatusBadge
        status={announcement.is_published ? 'published' : 'unpublished'}
        label={announcement.is_published ? 'Published' : 'Draft'}
      />
    ),
    title: (
      <div>
        <p className="font-semibold text-brand-dark">{announcement.title}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{announcement.body}</p>
      </div>
    ),
  }))

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Admin</p>
        <h1 className="mt-2 text-4xl">Announcements</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
          Publish updates for the community feed, giveaways, adverts, and event messaging from one place.
        </p>
      </section>

      <div className="space-y-3">
        <Toast message={error || errorMessage} tone="error" />
        <Toast message={successMessage} tone="success" />
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
        <Card className="p-6">
          <h2 className="text-3xl">Create announcement</h2>
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <Input label="Title" name="title" onChange={handleChange} required value={form.title} />
            <Select label="Category" name="category" onChange={handleChange} value={form.category}>
              <option value="general">General</option>
              <option value="event">Event</option>
              <option value="grant">Grant</option>
              <option value="giveaway">Giveaway</option>
              <option value="advert">Advert</option>
            </Select>
            <Input label="Image URL" name="imageUrl" onChange={handleChange} value={form.imageUrl} />
            <Textarea label="Body" name="body" onChange={handleChange} required value={form.body} />
            <label className="flex items-center gap-3 text-sm font-semibold text-brand-dark">
              <input checked={form.isPublished} name="isPublished" onChange={handleChange} type="checkbox" />
              Publish immediately
            </label>
            <Button disabled={updatingId === 'announcement'} type="submit">Create announcement</Button>
          </form>
        </Card>

        <Card className="p-6">
          {isLoading ? <div className="surface h-56 animate-pulse bg-white/70" /> : <Table columns={columns} rows={rows} />}
        </Card>
      </section>
    </div>
  )
}