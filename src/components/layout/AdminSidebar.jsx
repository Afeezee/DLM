import { NavLink } from 'react-router-dom'

const sections = [
  { label: 'Overview', to: '/admin' },
  { label: 'Appointments', to: '/admin/appointments' },
  { label: 'Services', to: '/admin/services' },
  { label: 'Fashion', to: '/admin/fashion' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Analytics', to: '/admin/analytics' },
]

function SidebarLinks({ onNavigate }) {
  return (
    <nav className="mt-10 space-y-2">
      {sections.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'block rounded-2xl px-4 py-3 text-sm font-medium transition',
              isActive
                ? 'bg-brand-dark text-brand-light'
                : 'text-brand-dark/70 hover:bg-brand-secondary/20 hover:text-brand-dark',
            ].join(' ')
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function AdminSidebar({ isMobileOpen = false, onClose = () => {} }) {
  return (
    <>
      <aside className="hidden border-r border-brand-dark/8 bg-white/85 lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72">
        <div className="flex h-full flex-col px-6 py-8">
          <div>
            <p className="font-display text-4xl">DLM</p>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-brand-dark/50">Admin Console</p>
          </div>
          <SidebarLinks />
        </div>
      </aside>

      <div
        className={[
          'fixed inset-0 z-40 bg-brand-dark/40 transition lg:hidden',
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      >
        <button
          type="button"
          aria-label="Close admin navigation"
          className="absolute inset-0"
          onClick={onClose}
        />
        <aside
          className={[
            'absolute inset-y-0 left-0 w-72 border-r border-brand-dark/8 bg-white/95 px-6 py-8 shadow-2xl backdrop-blur transition-transform',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-4xl">DLM</p>
              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-brand-dark/50">Admin Console</p>
            </div>
            <button
              type="button"
              aria-label="Close navigation"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-xl text-brand-dark"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <SidebarLinks onNavigate={onClose} />
        </aside>
      </div>
    </>
  )
}