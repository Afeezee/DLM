import Card from '../components/ui/Card'
import Toast from '../components/ui/Toast'
import { useCommunityFeed } from '../hooks/useCommunityFeed'
import { timeoutAgenda } from '../lib/community-content'
import { formatDate } from '../utils/formatDate'

export default function DlmTimeoutPage() {
  const { announcements, dataSource, error } = useCommunityFeed()
  const eventAnnouncement = announcements.find((announcement) => announcement.category === 'event')

  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-primary">DLM Tim-eout</p>
        <h1 className="mt-4 text-5xl leading-[0.95] sm:text-6xl">
          A quarterly pause for beauty, wellness, community visibility, and elevated soft-life moments.
        </h1>
        <p className="mt-6 text-lg leading-8 text-brand-dark/72">
          Tim-eout packages event storytelling, community presence, and curated studio experiences into a single branded moment.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <Toast message={error} tone="error" />
        <Toast
          message={dataSource === 'fallback' ? 'Showing curated event content while live announcements are unavailable.' : ''}
          tone="success"
        />
      </div>

      <div className="mt-10 grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-primary">Event experience</p>
          <h2 className="mt-3 text-3xl">What guests can expect</h2>
          <div className="mt-6 space-y-3 text-sm leading-6 text-brand-dark/68">
            {timeoutAgenda.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-primary">Latest event note</p>
          <h2 className="mt-3 text-3xl">{eventAnnouncement?.title ?? 'Upcoming Tim-eout release'}</h2>
          <p className="mt-4 text-sm leading-6 text-brand-dark/68">
            {eventAnnouncement?.body ?? 'Fresh event details will appear here as announcements are published from the admin workspace.'}
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-brand-dark/45">
            {eventAnnouncement ? formatDate(eventAnnouncement.published_at || eventAnnouncement.created_at) : 'Awaiting schedule update'}
          </p>
        </Card>
      </div>
    </section>
  )
}