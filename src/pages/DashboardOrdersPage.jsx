import Card from '../components/ui/Card'
import StatusBadge from '../components/shared/StatusBadge'
import { useUserFashionOrders } from '../hooks/useUserFashionOrders'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

export default function DashboardOrdersPage() {
  const { error, isLoading, orders } = useUserFashionOrders()

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Member area</p>
        <h1 className="mt-2 text-4xl">My fashion orders</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-dark/65">
          Track your checkout history, delivery status, and item summaries.
        </p>
      </section>

      {isLoading ? (
        <div className="surface h-56 animate-pulse bg-white/70" />
      ) : error ? (
        <Card className="p-6">
          <p className="text-sm text-brand-accent">{error}</p>
        </Card>
      ) : orders.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">
                    {formatDate(order.created_at)}
                  </p>
                  <h2 className="mt-2 text-3xl">{formatCurrency(order.total_amount ?? 0)}</h2>
                </div>
                <StatusBadge status={order.delivery_status} />
              </div>

              <div className="mt-5 space-y-3 text-sm leading-6 text-brand-dark/68">
                {(order.items ?? []).map((item, index) => (
                  <div key={`${order.id}-${index}`} className="flex items-center justify-between gap-3">
                    <span>{item.name}</span>
                    <span>x {item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] bg-brand-light/75 p-4 text-sm leading-6 text-brand-dark/65">
                <p>Delivery address: {order.delivery_address || 'Pending confirmation'}</p>
                {order.notes ? <p className="mt-2">Notes: {order.notes}</p> : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <p className="text-sm leading-6 text-brand-dark/65">
            No fashion orders have been recorded on this account yet.
          </p>
        </Card>
      )}
    </div>
  )
}