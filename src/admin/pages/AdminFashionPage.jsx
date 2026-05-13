import { useState } from 'react'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Textarea from '../../components/ui/Textarea'
import Toast from '../../components/ui/Toast'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAdminFashionManager } from '../../hooks/useAdminFashionManager'
import { exportCSV } from '../../utils/exportCSV'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

const categoryOptions = [
  { label: 'Ready-to-wear female', value: 'rtw-female' },
  { label: 'Ready-to-wear male', value: 'rtw-male' },
  { label: 'Bags', value: 'bags' },
  { label: 'Footwear', value: 'footwear' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Eyewear', value: 'eyewear' },
]

const initialProductForm = {
  category: 'rtw-female',
  description: '',
  imageUrls: '',
  isActive: true,
  memberPrice: '',
  name: '',
  standardPrice: '',
  stockQuantity: '0',
}

export default function AdminFashionPage() {
  const {
    createProduct,
    error,
    isCreatingProduct,
    isLoading,
    orders,
    products,
    updateOrderStatus,
    updateProduct,
    updatingId,
  } = useAdminFashionManager()
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [productForm, setProductForm] = useState(initialProductForm)

  const handleProductFormChange = (event) => {
    const { name, type, value, checked } = event.target

    setProductForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCreateProduct = async (event) => {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')

    const standardPrice = Number(productForm.standardPrice)
    const memberPrice = Number(productForm.memberPrice)
    const stockQuantity = Number(productForm.stockQuantity || 0)

    if (!productForm.name.trim()) {
      setErrorMessage('Add a product name before saving.')
      return
    }

    if (!Number.isFinite(standardPrice) || standardPrice <= 0) {
      setErrorMessage('Add a valid standard price before saving.')
      return
    }

    if (!Number.isFinite(memberPrice) || memberPrice <= 0) {
      setErrorMessage('Add a valid member price before saving.')
      return
    }

    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      setErrorMessage('Stock quantity cannot be negative.')
      return
    }

    try {
      await createProduct({
        category: productForm.category,
        description: productForm.description.trim(),
        image_urls: productForm.imageUrls
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        is_active: productForm.isActive,
        member_price: memberPrice,
        name: productForm.name.trim(),
        standard_price: standardPrice,
        stock_quantity: stockQuantity,
      })

      setProductForm(initialProductForm)
      setMessage('Fashion product added successfully.')
    } catch (createError) {
      setErrorMessage(createError.message)
    }
  }

  const handleStockChange = async (productId, nextQuantity) => {
    setMessage('')
    setErrorMessage('')

    try {
      await updateProduct(productId, { stock_quantity: Math.max(0, nextQuantity) })
      setMessage('Product stock updated.')
    } catch (updateError) {
      setErrorMessage(updateError.message)
    }
  }

  const handleToggleActive = async (productId, isActive) => {
    setMessage('')
    setErrorMessage('')

    try {
      await updateProduct(productId, { is_active: !isActive })
      setMessage('Product status updated.')
    } catch (updateError) {
      setErrorMessage(updateError.message)
    }
  }

  const handleOrderStatus = async (orderId, status) => {
    setMessage('')
    setErrorMessage('')

    try {
      await updateOrderStatus(orderId, status)
      setMessage('Order delivery status updated.')
    } catch (updateError) {
      setErrorMessage(updateError.message)
    }
  }

  const productColumns = [
    { key: 'product', label: 'Product' },
    { key: 'price', label: 'Price' },
    { key: 'stock', label: 'Stock' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ]

  const orderColumns = [
    { key: 'customer', label: 'Customer' },
    { key: 'items', label: 'Items' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Created' },
    { key: 'actions', label: 'Actions' },
  ]

  const productRows = products.map((product) => ({
    actions: (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-brand-dark/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/70"
          disabled={updatingId === product.id}
          onClick={() => void handleStockChange(product.id, Number(product.stock_quantity ?? 0) - 1)}
        >
          -1 stock
        </button>
        <button
          type="button"
          className="rounded-full border border-brand-dark/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/70"
          disabled={updatingId === product.id}
          onClick={() => void handleStockChange(product.id, Number(product.stock_quantity ?? 0) + 1)}
        >
          +1 stock
        </button>
        <button
          type="button"
          className="rounded-full border border-brand-dark/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/70"
          disabled={updatingId === product.id}
          onClick={() => void handleToggleActive(product.id, product.is_active)}
        >
          {product.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    ),
    id: product.id,
    price: (
      <div>
        <p>{formatCurrency(product.standard_price ?? 0)}</p>
        <p className="mt-1 text-xs text-brand-primary">
          Member {formatCurrency(product.member_price ?? product.standard_price ?? 0)}
        </p>
      </div>
    ),
    product: (
      <div>
        <p className="font-semibold text-brand-dark">{product.name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-dark/55">
          {product.category}
        </p>
      </div>
    ),
    status: <StatusBadge status={product.is_active ? 'active' : 'cancelled'} label={product.is_active ? 'active' : 'inactive'} />,
    stock: product.stock_quantity ?? 0,
  }))

  const orderRows = orders.map((order) => ({
    actions: (
      <div className="flex flex-wrap gap-2">
        {['processing', 'dispatched', 'delivered'].map((nextStatus) => (
          <button
            key={nextStatus}
            type="button"
            className="rounded-full border border-brand-dark/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/70"
            disabled={order.delivery_status === nextStatus || updatingId === order.id}
            onClick={() => void handleOrderStatus(order.id, nextStatus)}
          >
            {nextStatus}
          </button>
        ))}
      </div>
    ),
    created: formatDate(order.created_at),
    customer: (
      <div>
        <p className="font-semibold text-brand-dark">{order.user?.name ?? 'Unknown customer'}</p>
        <p className="mt-1 text-xs text-brand-dark/55">{order.user?.email ?? 'No email'}</p>
      </div>
    ),
    id: order.id,
    items: (order.items ?? [])
      .slice(0, 2)
      .map((item) => `${item.name} x ${item.qty}`)
      .join(', '),
    status: <StatusBadge status={order.delivery_status} />,
    total: formatCurrency(order.total_amount ?? 0),
  }))

  const exportRows = orders.map((order) => ({
    created_at: formatDate(order.created_at),
    customer: order.user?.name ?? 'Unknown customer',
    delivery_status: order.delivery_status,
    delivery_address: order.delivery_address ?? '',
    total_amount: Number(order.total_amount ?? 0),
  }))

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Admin</p>
          <h1 className="mt-2 text-4xl">Fashion management</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
            Manage inventory visibility, stock levels, and customer delivery progress from the live tables.
          </p>
        </div>
        <Button variant="secondary" onClick={() => exportCSV(exportRows, 'dlm-fashion-orders.csv')}>
          Export orders
        </Button>
      </section>

      <div className="space-y-3">
        <Toast message={error || errorMessage} tone="error" />
        <Toast message={message} tone="success" />
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl">Add fashion product</h2>
            <p className="mt-2 text-sm text-brand-dark/60">
              Create catalogue items with separate standard and member pricing.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleCreateProduct}>
          <div className="grid gap-5 lg:grid-cols-2">
            <Input
              label="Product name"
              name="name"
              onChange={handleProductFormChange}
              placeholder="Classic kaftan set"
              value={productForm.name}
            />
            <Select
              label="Category"
              name="category"
              onChange={handleProductFormChange}
              value={productForm.category}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Input
              label="Standard price"
              min="0"
              name="standardPrice"
              onChange={handleProductFormChange}
              placeholder="25000"
              step="0.01"
              type="number"
              value={productForm.standardPrice}
            />
            <Input
              label="Member price"
              min="0"
              name="memberPrice"
              onChange={handleProductFormChange}
              placeholder="22000"
              step="0.01"
              type="number"
              value={productForm.memberPrice}
            />
            <Input
              label="Stock quantity"
              min="0"
              name="stockQuantity"
              onChange={handleProductFormChange}
              step="1"
              type="number"
              value={productForm.stockQuantity}
            />
          </div>

          <Textarea
            label="Description"
            name="description"
            onChange={handleProductFormChange}
            placeholder="Describe the fabric, silhouette, fit, or styling details for shoppers."
            value={productForm.description}
          />

          <Input
            label="Image URLs"
            name="imageUrls"
            onChange={handleProductFormChange}
            placeholder="https://..., https://..."
            value={productForm.imageUrls}
          />

          <label className="flex items-center gap-3 text-sm font-semibold text-brand-dark">
            <input
              checked={productForm.isActive}
              className="h-4 w-4 rounded border border-brand-dark/20"
              name="isActive"
              onChange={handleProductFormChange}
              type="checkbox"
            />
            Publish this product immediately
          </label>

          <div className="flex justify-end">
            <Button disabled={isCreatingProduct} type="submit">
              {isCreatingProduct ? 'Adding product...' : 'Add fashion product'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl">Product inventory</h2>
            <p className="mt-2 text-sm text-brand-dark/60">Adjust stock and toggle product availability.</p>
          </div>
        </div>
        {isLoading ? (
          <div className="surface h-56 animate-pulse bg-white/70" />
        ) : productRows.length ? (
          <Table columns={productColumns} rows={productRows} />
        ) : (
          <p className="text-sm leading-6 text-brand-dark/65">No fashion products are available yet.</p>
        )}
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl">Fashion orders</h2>
            <p className="mt-2 text-sm text-brand-dark/60">Update customer delivery stages as fulfilment progresses.</p>
          </div>
        </div>
        {isLoading ? (
          <div className="surface h-56 animate-pulse bg-white/70" />
        ) : orderRows.length ? (
          <Table columns={orderColumns} rows={orderRows} />
        ) : (
          <p className="text-sm leading-6 text-brand-dark/65">No fashion orders have been recorded yet.</p>
        )}
      </Card>
    </div>
  )
}