import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ForgotForm } from '@/components/AuthForms'
import { AuthLayout } from '@/components/AuthLayout'
import { REGISTRATION_ENABLED } from '@/lib/config'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Восстановление пароля' }

// Письма уходят, когда в payload.config подключена почта (см. README, «Почта»).
export default function ForgotPage() {
  if (!REGISTRATION_ENABLED) redirect('/progress')
  return (
    <AuthLayout>
      <ForgotForm />
    </AuthLayout>
  )
}
