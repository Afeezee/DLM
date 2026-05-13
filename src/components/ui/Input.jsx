export default function Input({ className = '', label, error, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-brand-dark">{label}</span> : null}
      <input
        className={[
          'h-12 w-full rounded-2xl border border-brand-dark/10 bg-white px-4 text-brand-dark outline-none transition',
          'placeholder:text-brand-dark/35 focus:border-brand-primary',
          error ? 'border-red-400' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  )
}