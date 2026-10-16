import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthLayout } from '@/components/AuthLayout'
import { ResetForm } from '@/components/ResetForm'
import { REGISTRATION_ENABLED } from '@/lib/config'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Новый пароль' }

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  if (!REGISTRATION_ENABLED) redirect('/progress')
  const { token } = await params
  return (
    <AuthLayout>
      <ResetForm token={token} />
    </AuthLayout>
  )
}
