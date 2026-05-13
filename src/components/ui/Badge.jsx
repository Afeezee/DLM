export default function Badge({ className = '', children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-brand-secondary/35 text-brand-dark',
    accent: 'bg-brand-accent/15 text-brand-accent',
    dark: 'bg-brand-dark text-brand-light',
  }

  return (
    <span
      className={[
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]',
        tones[tone],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}