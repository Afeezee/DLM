import { useTheme } from '../../hooks/useTheme'

export default function ThemeToggle({ className = '', compact = false }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className={[
        'inline-flex items-center gap-3 rounded-full border border-brand-dark/10 bg-white/70 text-brand-dark shadow-sm backdrop-blur-xl transition hover:border-brand-primary/40',
        compact ? 'justify-center px-2 py-2' : 'pl-3 pr-2 py-2',
        className,
      ].join(' ')}
      onClick={toggleTheme}
    >
      {compact ? null : (
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-brand-dark/72">
          {isDark ? 'Dark mode' : 'Light mode'}
        </span>
      )}
      <span className="relative flex h-9 w-14 items-center rounded-full border border-brand-dark/10 bg-brand-dark/10 p-1">
        <span className="absolute left-2 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-brand-dark/45">
          L
        </span>
        <span className="absolute right-2 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-brand-dark/45">
          D
        </span>
        <span
          className={[
            'absolute left-1 top-1 h-7 w-7 rounded-full transition-transform duration-300',
            isDark ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
          style={{
            backgroundImage: 'var(--theme-toggle-knob)',
            boxShadow: 'var(--theme-toggle-shadow)',
          }}
        />
      </span>
    </button>
  )
}