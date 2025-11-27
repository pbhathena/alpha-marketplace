import { SignupForm } from '@/components/auth/SignupForm'

export function Signup() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="relative z-10">
        <SignupForm />
      </div>
    </div>
  )
}
