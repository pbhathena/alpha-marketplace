import { LoginForm } from '@/components/auth/LoginForm'

export function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="relative z-10">
        <LoginForm />
      </div>
    </div>
  )
}
