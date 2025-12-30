import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'

const highlights = [
  {
    title: 'Booking overview',
    description: 'See today’s schedule and upcoming clients at a glance.',
  },
  {
    title: 'Payments',
    description: 'Track payouts and reconcile online payments from bookings.',
  },
  {
    title: 'Staff tools',
    description: 'Assign services, manage availability, and keep shifts aligned.',
  },
]

function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="grid items-center gap-10 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/60 to-indigo-950 p-10 shadow-xl">
        <div className="flex flex-col gap-6">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Boka Businesses</p>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
            Manage your barbershop in one place.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            A centralized dashboard for staff to view bookings, monitor payments, and keep the team
            aligned. Built to pair with your customer-facing booking site.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/login">Go to staff login</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/dashboard">Preview dashboard shell</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map(({ title, description }) => (
          <Card key={title} className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-300">{description}</p>
          </Card>
        ))}
      </section>
    </div>
  )
}

export default HomePage
