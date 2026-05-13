import { useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'
import Textarea from '../../components/ui/Textarea'
import Toast from '../../components/ui/Toast'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAdminCourses } from '../../hooks/useAdminCourses'
import { formatCurrency } from '../../utils/formatCurrency'

const initialForm = {
  category: 'identity',
  description: '',
  imageUrl: '',
  isActive: true,
  memberPrice: '',
  selarUrl: '',
  standardPrice: '',
  title: '',
}

export default function AdminCoursesPage() {
  const { courses, createCourse, error, isLoading, updateCourse, updatingId } = useAdminCourses()
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
      await createCourse(form)
      setForm(initialForm)
      setSuccessMessage('Course created successfully.')
    } catch (createError) {
      setErrorMessage(createError.message)
    }
  }

  const handleToggleActive = async (course) => {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await updateCourse(course.id, { is_active: !course.is_active })
      setSuccessMessage('Course visibility updated.')
    } catch (updateError) {
      setErrorMessage(updateError.message)
    }
  }

  const columns = [
    { key: 'course', label: 'Course' },
    { key: 'category', label: 'Category' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = courses.map((course) => ({
    actions: (
      <Button disabled={updatingId === course.id} onClick={() => void handleToggleActive(course)} variant="secondary">
        {course.is_active ? 'Unpublish' : 'Publish'}
      </Button>
    ),
    category: String(course.category ?? 'general').replaceAll('-', ' '),
    course: (
      <div>
        <p className="font-semibold text-brand-dark">{course.title}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{course.selar_url || 'No Selar link'}</p>
      </div>
    ),
    id: course.id,
    pricing: (
      <div className="space-y-1 text-xs text-brand-dark/65">
        <p>Standard: {formatCurrency(Number(course.standard_price ?? 0))}</p>
        <p>Member: {formatCurrency(Number(course.member_price ?? 0))}</p>
      </div>
    ),
    status: <StatusBadge status={course.is_active ? 'published' : 'unpublished'} label={course.is_active ? 'Published' : 'Unpublished'} />,
  }))

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Admin</p>
        <h1 className="mt-2 text-4xl">Courses management</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
          Create and publish courses that route customers to Selar while maintaining marketplace pricing control.
        </p>
      </section>

      <div className="space-y-3">
        <Toast message={error || errorMessage} tone="error" />
        <Toast message={successMessage} tone="success" />
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card className="p-6">
          <h2 className="text-3xl">Add course</h2>
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <Input label="Title" name="title" onChange={handleChange} required value={form.title} />
            <Select label="Category" name="category" onChange={handleChange} value={form.category}>
              <option value="identity">Identity</option>
              <option value="health">Health</option>
              <option value="relationships">Relationships</option>
              <option value="career">Career</option>
            </Select>
            <Input label="Standard price" name="standardPrice" onChange={handleChange} required type="number" value={form.standardPrice} />
            <Input label="Member price" name="memberPrice" onChange={handleChange} required type="number" value={form.memberPrice} />
            <Input label="Selar URL" name="selarUrl" onChange={handleChange} value={form.selarUrl} />
            <Input label="Image URL" name="imageUrl" onChange={handleChange} value={form.imageUrl} />
            <div className="md:col-span-2">
              <Textarea label="Description" name="description" onChange={handleChange} required value={form.description} />
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold text-brand-dark md:col-span-2">
              <input checked={form.isActive} name="isActive" onChange={handleChange} type="checkbox" />
              Publish immediately
            </label>
            <div className="md:col-span-2">
              <Button disabled={updatingId === 'course'} type="submit">Create course</Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          {isLoading ? <div className="surface h-56 animate-pulse bg-white/70" /> : <Table columns={columns} rows={rows} />}
        </Card>
      </section>
    </div>
  )
}