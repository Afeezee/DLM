import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Toast from '../components/ui/Toast'
import StatusBadge from '../components/shared/StatusBadge'
import { useAuth } from '../hooks/useAuth'
import { useCommunityFeed } from '../hooks/useCommunityFeed'
import { formatDate } from '../utils/formatDate'

export default function CommunityPage() {
  const { user } = useAuth()
  const {
    announcements,
    currentMonth,
    dataSource,
    enterGiveaway,
    error,
    giveawayEntry,
    isEntering,
  } = useCommunityFeed()
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleGiveawayEntry = async () => {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await enterGiveaway()
      setSuccessMessage(`You are entered for the ${currentMonth} community giveaway.`)
    } catch (entryError) {
      setErrorMessage(entryError.message)
    }
  }

  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-primary">Community</p>
          <h1 className="mt-4 text-5xl leading-[0.95] sm:text-6xl">
            Announcements, grants, and giveaway moments live together in the DLM community feed.
          </h1>
          <p className="mt-6 text-lg leading-8 text-brand-dark/72">
            Browse published updates from the brand and join the current monthly giveaway when registration is open.
          </p>

          <div className="mt-8 space-y-3">
            <Toast message={error || errorMessage} tone="error" />
            <Toast
              message={successMessage || (dataSource === 'fallback' ? 'Showing curated fallback announcements right now.' : '')}
              tone="success"
            />
          </div>
        </div>

        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-primary">Monthly giveaway</p>
          <h2 className="mt-3 text-3xl">Enter this month’s draw</h2>
          <p className="mt-4 text-sm leading-6 text-brand-dark/68">
            Giveaway entries are stored once per month per user, so repeat clicks do not duplicate your entry.
          </p>
          <div className="mt-6 space-y-4 text-sm text-brand-dark/65">
            <p>Current round: {currentMonth}</p>
            <p>Status: {giveawayEntry ? <StatusBadge status="registered" label="Entered" /> : 'Open'}</p>
          </div>
          <div className="mt-6">
            {user ? (
              <Button disabled={Boolean(giveawayEntry) || isEntering} onClick={() => void handleGiveawayEntry()}>
                {giveawayEntry ? 'Already entered' : 'Enter giveaway'}
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="secondary">Sign in to enter</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-10 grid gap-5 xl:grid-cols-3">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-primary">
              {String(announcement.category ?? 'general').replaceAll('-', ' ')}
            </p>
            <h2 className="mt-3 text-3xl">{announcement.title}</h2>
            <p className="mt-4 text-sm leading-6 text-brand-dark/68">{announcement.body}</p>
            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-brand-dark/45">
              {formatDate(announcement.published_at || announcement.created_at)}
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}