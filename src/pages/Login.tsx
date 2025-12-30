import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

function LoginPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Card className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Staff login</p>
          <h2 className="text-2xl font-semibold text-white">Access your dashboard</h2>
          <p className="text-sm text-slate-300">
            Sign in with your staff credentials to manage bookings and payments.
          </p>
        </div>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" name="email" type="email" placeholder="you@barbershop.com" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" />
          </div>
          <Button type="submit" size="lg">
            Continue
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <Link to="/">Back to home</Link>
          <Link to="/dashboard" className="text-indigo-200 hover:text-indigo-100">
            Skip to dashboard preview
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
