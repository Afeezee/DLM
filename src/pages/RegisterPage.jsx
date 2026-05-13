import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Toast from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  gender: 'female',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { isSupabaseConfigured, signUp } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!isSupabaseConfigured) {
      setErrorMessage('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before creating accounts.')
      return
    }

    if (form.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    const { error } = await signUp({
      email: form.email,
      password: form.password,
      profile: {
        name: form.name,
        phone: form.phone,
        gender: form.gender,
      },
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setSuccessMessage('Account created. Check your email if confirmation is enabled, then sign in.')
    setTimeout(() => navigate('/login', { replace: true }), 1200)
  }

  return (
    <section className="shell py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="bg-brand-secondary/35 p-8 sm:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-primary">Membership</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">Create your Denomis Luxury profile.</h1>
          <p className="mt-5 text-base leading-7 text-brand-dark/68">
            Registration creates your platform account, prepares your dashboard, and writes your profile into the DLM users table for bookings, fashion orders, and future membership billing.
          </p>
          <div className="mt-8 space-y-3 text-sm leading-6 text-brand-dark/68">
            <p>One account across services, fashion, trainings, community programmes, and future course purchases.</p>
            <p>Member pricing activates once the membership lifecycle is connected to Paystack recurring billing.</p>
            <p>Admin-only routes remain role protected by the profile record stored in Supabase.</p>
          </div>
        </Card>

        <Card className="p-8 sm:p-10">
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="sm:col-span-2">
              <Input label="Full name" name="name" onChange={handleChange} placeholder="Enter your full name" value={form.name} />
            </div>
            <Input label="Email address" name="email" onChange={handleChange} placeholder="you@example.com" type="email" value={form.email} />
            <Input label="Phone number" name="phone" onChange={handleChange} placeholder="0800 000 0000" value={form.phone} />
            <Select label="Gender" name="gender" onChange={handleChange} value={form.gender}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </Select>
            <div className="sm:col-span-2 grid gap-5 sm:grid-cols-2">
              <Input label="Password" name="password" onChange={handleChange} placeholder="Create a password" type="password" value={form.password} />
              <Input label="Confirm password" name="confirmPassword" onChange={handleChange} placeholder="Repeat your password" type="password" value={form.confirmPassword} />
            </div>
            <div className="sm:col-span-2">
              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
            <div className="sm:col-span-2 space-y-3">
              <Toast message={errorMessage} tone="error" />
              <Toast message={successMessage} tone="success" />
            </div>
          </form>
          <p className="mt-6 text-sm text-brand-dark/62">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-brand-primary">
              Sign in instead
            </Link>
          </p>
        </Card>
      </div>
    </section>
  )
}