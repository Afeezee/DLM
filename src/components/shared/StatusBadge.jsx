const toneMap = {
  active: 'bg-emerald-100 text-emerald-700',
  approved: 'bg-emerald-100 text-emerald-700',
  attended: 'bg-emerald-100 text-emerald-700',
  admin: 'bg-brand-dark text-brand-light',
  cancelled: 'bg-rose-100 text-rose-700',
  completed: 'bg-emerald-100 text-emerald-700',
  confirmed: 'bg-sky-100 text-sky-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  expired: 'bg-zinc-200 text-zinc-700',
  failed: 'bg-rose-100 text-rose-700',
  'in-progress': 'bg-sky-100 text-sky-700',
  inactive: 'bg-zinc-200 text-zinc-700',
  pending: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  preview: 'bg-amber-100 text-amber-700',
  processing: 'bg-sky-100 text-sky-700',
  registered: 'bg-violet-100 text-violet-700',
  ready: 'bg-sky-100 text-sky-700',
  rejected: 'bg-rose-100 text-rose-700',
  reviewed: 'bg-indigo-100 text-indigo-700',
  success: 'bg-emerald-100 text-emerald-700',
  unpublished: 'bg-zinc-200 text-zinc-700',
  user: 'bg-brand-secondary/40 text-brand-dark',
}

export default function StatusBadge({ label, status }) {
  const normalizedStatus = String(status ?? '').toLowerCase()

  return (
    <span
      className={[
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
        toneMap[normalizedStatus] ?? 'bg-brand-secondary/30 text-brand-dark',
      ].join(' ')}
    >
      {label ?? normalizedStatus.replaceAll('-', ' ')}
    </span>
  )
}