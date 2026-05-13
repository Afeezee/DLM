import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Fashion', to: '/fashion' },
  { label: 'Trainings', to: '/trainings' },
  { label: 'Community', to: '/community' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { profile, signOut, user } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-dark/8 bg-brand-light/80 backdrop-blur-lg">
      <div className="shell flex items-center justify-between gap-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-dark text-sm font-bold uppercase tracking-[0.22em] text-brand-light">
            DLM
          </div>
          <div>
            <p className="font-display text-2xl leading-none">Denomis Luxury</p>
            <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/50">Marketplace</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'text-brand-primary' : 'text-sm font-medium text-brand-dark/70 hover:text-brand-dark'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link to={profile?.role === 'admin' ? '/admin' : '/dashboard'}>
                <Button variant="secondary">Dashboard</Button>
              </Link>
              <Button onClick={handleSignOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Join membership</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/10 bg-white/70 lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-label="Toggle navigation"
        >
          <span className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-brand-dark" />
            <span className="block h-0.5 w-5 bg-brand-dark" />
            <span className="block h-0.5 w-5 bg-brand-dark" />
          </span>
        </button>
      </div>

      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="border-t border-brand-dark/8 bg-white/90 lg:hidden"
        >
          <div className="shell flex flex-col gap-4 py-4">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setIsOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <Link to={profile?.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <button type="button" className="text-left" onClick={handleSignOut}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  Join membership
                </Link>
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </header>
  )
}