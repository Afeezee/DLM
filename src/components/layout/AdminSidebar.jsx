import { NavLink } from 'react-router-dom'

const sections = [
  { label: 'Overview', to: '/admin' },
  { label: 'Appointments', to: '/admin/appointments' },
  { label: 'Services', to: '/admin/services' },
  { label: 'Fashion', to: '/admin/fashion' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Analytics', to: '/admin/analytics' },
]

export default function AdminSidebar() {
  return (
    <aside className="hidden border-r border-brand-dark/8 bg-white/85 lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72">
      <div className="flex h-full flex-col px-6 py-8">
        <div>
          <p className="font-display text-4xl">DLM</p>
          <p className="mt-1 text-xs uppercase tracking-[0.28em] text-brand-dark/50">Admin Console</p>
        </div>
        <nav className="mt-10 space-y-2">
          {sections.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
      </div>
    </aside>
  )
}