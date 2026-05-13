import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Toast from '../components/ui/Toast'
import { useCoursesCatalog } from '../hooks/useCoursesCatalog'
import { useMembership } from '../hooks/useMembership'
import { formatCurrency } from '../utils/formatCurrency'

export default function PersonalHubPage() {
  const { courses, dataSource, error } = useCoursesCatalog()
  const { isMember } = useMembership()

  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-primary">Personal hub</p>
        <h1 className="mt-4 text-5xl leading-[0.95] sm:text-6xl">
          Explore practical courses across identity, career, relationships, and health.
        </h1>
        <p className="mt-6 text-lg leading-8 text-brand-dark/72">
          Course links route out to Selar while pricing and catalogue visibility stay consistent with the DLM member experience.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <Toast message={error} tone="error" />
        <Toast
          message={dataSource === 'fallback' ? 'Showing curated fallback courses while live course data is unavailable.' : ''}
          tone="success"
        />
      </div>

      <div className="mt-10 grid gap-5 xl:grid-cols-3">
        {courses.map((course) => {
          const price = isMember ? Number(course.member_price ?? course.standard_price ?? 0) : Number(course.standard_price ?? 0)

          return (
            <Card key={course.id} className="overflow-hidden p-0">
              <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${course.image_url})` }} />
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-brand-primary">
                  {String(course.category ?? 'general').replaceAll('-', ' ')}
                </p>
                <h2 className="mt-3 text-3xl">{course.title}</h2>
                <p className="mt-4 text-sm leading-6 text-brand-dark/68">{course.description}</p>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-dark/45">
                      {isMember ? 'Member price' : 'Standard price'}
                    </p>
                    <p className="mt-1 font-display text-3xl">{formatCurrency(price)}</p>
                  </div>
                  <a href={course.selar_url || 'https://selar.co'} rel="noreferrer" target="_blank">
                    <Button>View course</Button>
                  </a>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}