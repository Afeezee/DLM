import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'
import Textarea from '../../components/ui/Textarea'
import Toast from '../../components/ui/Toast'
import CloudinaryUploadField from '../../components/shared/CloudinaryUploadField'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAdminServicesManager } from '../../hooks/useAdminServicesManager'
import { formatCurrency } from '../../utils/formatCurrency'

const initialCategoryForm = {
  displayOrder: '',
  name: '',
  slug: '',
}

const initialServiceForm = {
  categoryId: '',
  description: '',
  durationMins: '',
  hasHomeService: true,
  homeServiceMemberPrice: '',
  homeServiceStandardPrice: '',
  imageUrl: '',
  isActive: true,
  memberPrice: '',
  name: '',
  standardPrice: '',
}

function SummaryCard({ hint, label, value }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">{label}</p>
      <p className="mt-3 font-display text-4xl">{value}</p>
      <p className="mt-2 text-sm text-brand-dark/60">{hint}</p>
    </Card>
  )
}

export default function AdminServicesPage() {
  const {
    categories,
    createCategory,
    createService,
    error,
    isLoading,
    services,
    updateService,
    updatingId,
  } = useAdminServicesManager()
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm)
  const [serviceForm, setServiceForm] = useState(initialServiceForm)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const summary = useMemo(
    () => ({
      active: services.filter((service) => service.is_active).length,
      categories: categories.length,
      homeService: services.filter((service) => service.has_home_service).length,
    }),
    [categories.length, services],
  )

  const handleCategoryChange = (event) => {
    const { name, value } = event.target
    setCategoryForm((current) => ({ ...current, [name]: value }))
  }

  const handleServiceChange = (event) => {
    const { checked, name, type, value } = event.target
    setServiceForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleServiceImagesUploaded = (uploads) => {
    const nextUrl = uploads[0]?.secureUrl

    if (!nextUrl) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('Service image uploaded successfully.')
    setServiceForm((current) => ({
      ...current,
      imageUrl: nextUrl,
    }))
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await createCategory(categoryForm)
      setCategoryForm(initialCategoryForm)
      setSuccessMessage('Service category created.')
    } catch (createError) {
      setErrorMessage(createError.message)
    }
  }

  const handleServiceSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await createService(serviceForm)
      setServiceForm(initialServiceForm)
      setSuccessMessage('Service created successfully.')
    } catch (createError) {
      setErrorMessage(createError.message)
    }
  }

  const columns = [
    { key: 'service', label: 'Service' },
    { key: 'category', label: 'Category' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = services.map((service) => ({
    actions: (
      <Button
        disabled={updatingId === service.id}
        onClick={() => void updateService(service.id, { is_active: !service.is_active })}
        variant="secondary"
      >
        {service.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    ),
    category: service.category?.name ?? 'Unassigned',
    id: service.id,
    pricing: (
      <div className="space-y-1 text-xs text-brand-dark/65">
        <p>Standard: {formatCurrency(Number(service.standard_price ?? 0))}</p>
        <p>Member: {formatCurrency(Number(service.member_price ?? 0))}</p>
        {service.has_home_service ? (
          <p>
            Home: {formatCurrency(Number(service.home_service_standard_price ?? 0))} /
            {' '}
            {formatCurrency(Number(service.home_service_member_price ?? 0))}
          </p>
        ) : null}
      </div>
    ),
    service: (
      <div>
        <p className="font-semibold text-brand-dark">{service.name}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{service.duration_mins ?? 'N/A'} mins</p>
      </div>
    ),
    status: <StatusBadge status={service.is_active ? 'active' : 'inactive'} label={service.is_active ? 'Active' : 'Inactive'} />,
  }))

  const serviceImagePreviews = serviceForm.imageUrl ? [serviceForm.imageUrl] : []

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Admin</p>
        <h1 className="mt-2 text-4xl">Service management</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
          Manage service categories, create new services, and control whether each offer is visible for booking.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard hint="Bookable services currently visible on the marketplace" label="Active services" value={summary.active} />
        <SummaryCard hint="Configured service groupings" label="Categories" value={summary.categories} />
        <SummaryCard hint="Services offering home visits" label="Home-service enabled" value={summary.homeService} />
      </section>

      <div className="space-y-3">
        <Toast message={error || errorMessage} tone="error" />
        <Toast message={successMessage} tone="success" />
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.7fr,1.3fr]">
        <Card className="p-6">
          <h2 className="text-3xl">Add category</h2>
          <form className="mt-5 space-y-4" onSubmit={handleCategorySubmit}>
            <Input label="Name" name="name" onChange={handleCategoryChange} required value={categoryForm.name} />
            <Input label="Slug" name="slug" onChange={handleCategoryChange} placeholder="optional-auto-generated" value={categoryForm.slug} />
            <Input label="Display order" name="displayOrder" onChange={handleCategoryChange} type="number" value={categoryForm.displayOrder} />
            <Button disabled={updatingId === 'category'} type="submit">Create category</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-3xl">Add service</h2>
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleServiceSubmit}>
            <Input label="Service name" name="name" onChange={handleServiceChange} required value={serviceForm.name} />
            <Select label="Category" name="categoryId" onChange={handleServiceChange} value={serviceForm.categoryId}>
              <option value="">Unassigned</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Input label="Standard price" name="standardPrice" onChange={handleServiceChange} required type="number" value={serviceForm.standardPrice} />
            <Input label="Member price" name="memberPrice" onChange={handleServiceChange} required type="number" value={serviceForm.memberPrice} />
            <Input
              label="Home standard price"
              name="homeServiceStandardPrice"
              onChange={handleServiceChange}
              type="number"
              value={serviceForm.homeServiceStandardPrice}
            />
            <Input
              label="Home member price"
              name="homeServiceMemberPrice"
              onChange={handleServiceChange}
              type="number"
              value={serviceForm.homeServiceMemberPrice}
            />
            <Input label="Duration (mins)" name="durationMins" onChange={handleServiceChange} type="number" value={serviceForm.durationMins} />
            <div className="md:col-span-2 space-y-4">
              <Input label="Image URL" name="imageUrl" onChange={handleServiceChange} value={serviceForm.imageUrl} />
              <CloudinaryUploadField
                folder="services"
                helperText="Upload a service cover image directly to Cloudinary, then create the service with the saved URL."
                label="Service image"
                onUploaded={handleServiceImagesUploaded}
                previews={serviceImagePreviews}
              />
            </div>
            <div className="md:col-span-2">
              <Textarea label="Description" name="description" onChange={handleServiceChange} required value={serviceForm.description} />
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold text-brand-dark">
              <input checked={serviceForm.hasHomeService} name="hasHomeService" onChange={handleServiceChange} type="checkbox" />
              Home service available
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-brand-dark">
              <input checked={serviceForm.isActive} name="isActive" onChange={handleServiceChange} type="checkbox" />
              Publish immediately
            </label>
            <div className="md:col-span-2">
              <Button disabled={updatingId === 'service'} type="submit">Create service</Button>
            </div>
          </form>
        </Card>
      </section>

      <Card className="p-6">
        {isLoading ? <div className="surface h-56 animate-pulse bg-white/70" /> : <Table columns={columns} rows={rows} />}
      </Card>
    </div>
  )
}