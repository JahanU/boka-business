import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function LoginPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Staff login</p>
          <CardTitle className="text-2xl">Access your dashboard</CardTitle>
          <CardDescription>
            Sign in with your staff credentials to manage bookings and payments.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
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
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
