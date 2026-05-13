import Badge from '../ui/Badge'
import { formatCurrency } from '../../utils/formatCurrency'

export default function PricingBadge({ amount, label = 'From' }) {
  return <Badge tone="dark">{label} {formatCurrency(amount)}</Badge>
}