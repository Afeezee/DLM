import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Toast from '../components/ui/Toast'
import StatusBadge from '../components/shared/StatusBadge'
import { useAuth } from '../hooks/useAuth'
import { useTrainingRegistrations } from '../hooks/useTrainingRegistrations'
import { fallbackTrainingProgrammes } from '../lib/training-programmes'

export default function TrainingsPage() {
  const { user } = useAuth()
  const { isRegistering, registerForTraining, registrations } = useTrainingRegistrations()
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const registrationMap = new Map(
    registrations.map((registration) => [registration.programme_name, registration]),
  )

  const handleRegister = async (programmeName) => {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await registerForTraining(programmeName)
      setSuccessMessage(`${programmeName} registration saved.`)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-primary">Free trainings</p>
        <h1 className="mt-4 text-5xl leading-[0.95] sm:text-6xl">
          Join DLM training programmes designed for growth, confidence, and practical skill building.
        </h1>
        <p className="mt-6 text-lg leading-8 text-brand-dark/72">
          Registration is free. The platform stores your status while the actual sessions happen through WhatsApp, Zoom, or physical meetups.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <Toast message={errorMessage} tone="error" />
        <Toast message={successMessage} tone="success" />
      </div>

      <div className="mt-10 grid gap-5 xl:grid-cols-3">
        {fallbackTrainingProgrammes.map((programme) => {
          const registration = registrationMap.get(programme.name)

          return (
            <Card key={programme.name} className="flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-brand-primary">
                    {programme.mode}
                  </p>
                  <h2 className="mt-2 text-3xl">{programme.name}</h2>
                </div>
                {registration ? <StatusBadge status={registration.status} /> : null}
              </div>

              <p className="mt-4 text-sm leading-6 text-brand-dark/68">{programme.description}</p>

              <div className="mt-5 space-y-2 text-sm text-brand-dark/65">
                <p>Duration: {programme.duration}</p>
                <p>Schedule: {programme.schedule}</p>
                <p>Venue: {programme.venue}</p>
              </div>

              <div className="mt-auto pt-6">
                {user ? (
                  <Button
                    className="w-full"
                    disabled={Boolean(registration) || isRegistering}
                    onClick={() => void handleRegister(programme.name)}
                    variant={registration ? 'secondary' : 'primary'}
                  >
                    {registration ? 'Registered' : 'Register for free'}
                  </Button>
                ) : (
                  <Link to="/login" className="inline-flex w-full">
                    <Button className="w-full" variant="secondary">
                      Sign in to register
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}