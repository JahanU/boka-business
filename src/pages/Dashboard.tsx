import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const stats = [
  { label: 'Today’s bookings', value: '18' },
  { label: 'Pending payments', value: '$1,240' },
  { label: 'Returning clients', value: '64%' },
]

function DashboardPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {stats.map(({ label, value }) => (
        <Card key={label}>
          <CardHeader className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
            <CardTitle className="text-3xl">{value}</CardTitle>
          </CardHeader>
        </Card>
      ))}

      <Card className="lg:col-span-3">
        <CardHeader>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Inbox</p>
          <CardTitle className="text-xl">No messages yet</CardTitle>
          <CardDescription>
            When customers leave notes with their bookings they will show here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-muted p-4 text-sm text-muted-foreground">
            Replace this area with live bookings, payment events, or team activity once the backend
            is wired up.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
