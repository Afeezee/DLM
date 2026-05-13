const footerLinks = [
  'Premium beauty bookings',
  'Member fashion pricing',
  'Free trainings and community support',
]

export default function Footer() {
  return (
    <footer className="border-t border-brand-dark/8 bg-white/65">
      <div className="shell flex flex-col gap-6 py-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-display text-3xl">Denomis Luxury Marketplace</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-brand-dark/65">
            A premium membership-first platform for beauty, fashion, lifestyle, and community experiences in Nigeria.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-brand-dark/65 sm:grid-cols-3 sm:gap-4">
          {footerLinks.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>
    </footer>
  )
}