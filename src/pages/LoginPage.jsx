import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isSupabaseConfigured, signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname ?? '/dashboard'

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!isSupabaseConfigured) {
      setErrorMessage('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using authentication.')
      return
    }

    setIsSubmitting(true)

    const { data, error } = await signIn(form)

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    navigate(data?.profile?.role === 'admin' ? '/admin' : redirectTo, { replace: true })
  }

  return (
    <section className="shell py-16 sm:py-24">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-brand-dark p-8 text-brand-light sm:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-light/55">Sign in</p>
          <h1 className="mt-4 text-4xl text-brand-light sm:text-5xl">Return to your DLM account.</h1>
          <p className="mt-5 text-base leading-7 text-brand-light/72">
            Continue to your dashboard, manage future appointments, and access your membership-connected pricing once Supabase credentials are configured.
          </p>
        </Card>

        <Card className="p-8 sm:p-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input label="Email address" name="email" onChange={handleChange} placeholder="you@example.com" type="email" value={form.email} />
            <Input label="Password" name="password" onChange={handleChange} placeholder="Enter your password" type="password" value={form.password} />
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
            <Toast message={errorMessage} tone="error" />
          </form>
          <p className="mt-6 text-sm text-brand-dark/62">
            New to DLM?{' '}
            <Link to="/register" className="font-semibold text-brand-primary">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </section>
  )
}