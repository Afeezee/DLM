export default function Toast({ message, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-brand-dark text-brand-light',
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
  }

  if (!message) {
    return null
  }

  return (
    <div className={["rounded-2xl px-4 py-3 text-sm font-medium shadow-lg", tones[tone]].join(' ')}>
      {message}
    </div>
  )
}