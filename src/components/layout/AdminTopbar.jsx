import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

export default function AdminTopbar({ onMenuOpen = () => {} }) {
  const { profile, signOut } = useAuth()

  return (
    <header className="border-b border-brand-dark/8 bg-white/75 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Operations dashboard</p>
          <h1 className="mt-2 text-2xl sm:text-3xl">Welcome back, {profile?.name?.split(' ')[0] ?? 'Admin'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open admin navigation"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark lg:hidden"
            onClick={onMenuOpen}
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>
          <Link to="/">
            <Button className="hidden sm:inline-flex" variant="secondary">View site</Button>
          </Link>
          <Button onClick={signOut}>Sign out</Button>
        </div>
      </div>
    </header>
  )
}