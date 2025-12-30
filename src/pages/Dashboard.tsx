import { Card } from '../components/ui/card'

const stats = [
  { label: 'Today’s bookings', value: '18' },
  { label: 'Pending payments', value: '$1,240' },
  { label: 'Returning clients', value: '64%' },
]

function DashboardPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {stats.map(({ label, value }) => (
        <Card key={label} className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="text-3xl font-semibold text-white">{value}</p>
        </Card>
      ))}

      <Card className="lg:col-span-3">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Inbox</p>
            <h3 className="text-xl font-semibold text-white">No messages yet</h3>
            <p className="text-sm text-slate-300">
              When customers leave notes with their bookings they will show here.
            </p>
          </div>
          <div className="rounded-lg border border-dashed border-slate-800 p-4 text-sm text-slate-400">
            Replace this area with live bookings, payment events, or team activity once the backend
            is wired up.
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DashboardPage
