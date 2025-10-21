import { createFileRoute } from '@tanstack/react-router'
import { PasswordReset } from '@/components/PasswordReset'

export const Route = createFileRoute('/reset-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PasswordReset />
}
