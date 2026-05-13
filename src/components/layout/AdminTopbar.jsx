import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

export default function AdminTopbar() {
  const { profile, signOut } = useAuth()

  return (
    <header className="border-b border-brand-dark/8 bg-white/75 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-dark/45">Operations dashboard</p>
          <h1 className="mt-2 text-3xl">Welcome back, {profile?.name?.split(' ')[0] ?? 'Admin'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="secondary">View site</Button>
          </Link>
          <Button onClick={signOut}>Sign out</Button>
        </div>
      </div>
    </header>
  )
}