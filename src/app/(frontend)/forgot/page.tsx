import type { Metadata } from 'next'

import { ForgotForm } from '@/components/AuthForms'
import { AuthLayout } from '@/components/AuthLayout'

export const metadata: Metadata = { title: 'Восстановление пароля' }

// Письма уходят, когда в payload.config подключена почта (см. README, «Почта»).
export default function ForgotPage() {
  return (
    <AuthLayout>
      <ForgotForm />
    </AuthLayout>
  )
}
