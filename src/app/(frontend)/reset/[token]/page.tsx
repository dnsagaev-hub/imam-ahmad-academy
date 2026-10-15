import type { Metadata } from 'next'

import { AuthLayout } from '@/components/AuthLayout'
import { ResetForm } from '@/components/ResetForm'

export const metadata: Metadata = { title: 'Новый пароль' }

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return (
    <AuthLayout>
      <ResetForm token={token} />
    </AuthLayout>
  )
}
