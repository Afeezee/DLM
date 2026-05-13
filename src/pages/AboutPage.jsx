import Card from '../components/ui/Card'

const pillars = [
  {
    body: 'Beauty, fashion, and wellness offers are structured as one coordinated luxury experience rather than isolated transactions.',
    title: 'Integrated care',
  },
  {
    body: 'Membership, training, and community tools are designed to make premium experiences more accessible and more repeatable.',
    title: 'Accessible luxury',
  },
  {
    body: 'Every booking, order, and learning offer is built around clarity, calm presentation, and practical follow-through.',
    title: 'Operational polish',
  },
]

export default function AboutPage() {
  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-primary">About DLM</p>
        <h1 className="mt-4 text-5xl leading-[0.95] sm:text-6xl">
          Denomis Luxury Marketplace brings beauty, fashion, personal development, and community care into one platform.
        </h1>
        <p className="mt-6 text-lg leading-8 text-brand-dark/72">
          The studio was designed to feel premium without being distant: practical bookings, elegant products, free growth programmes, and structured member pricing all live in one place.
        </p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <Card key={pillar.title} className="p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-primary">Pillar</p>
            <h2 className="mt-3 text-3xl">{pillar.title}</h2>
            <p className="mt-4 text-sm leading-6 text-brand-dark/68">{pillar.body}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-8">
        <h2 className="text-3xl">What the marketplace connects</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-3 text-sm leading-6 text-brand-dark/68">
            <p>Luxury beauty and home-service bookings with member-aware pricing.</p>
            <p>Fashion catalogue checkout backed by server-side payment verification.</p>
            <p>Free training access for business, confidence, and community growth.</p>
          </div>
          <div className="space-y-3 text-sm leading-6 text-brand-dark/68">
            <p>Quarterly event storytelling through DLM Tim-eout.</p>
            <p>Advert submission workflows for brand visibility and partner campaigns.</p>
            <p>Admin operations for appointments, memberships, products, and content oversight.</p>
          </div>
        </div>
      </Card>
    </section>
  )
}