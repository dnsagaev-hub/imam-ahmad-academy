import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/AuthForms'
import { AuthLayout } from '@/components/AuthLayout'
import { getCurrentUser } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Вход' }

export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/cabinet')
  return (
    <AuthLayout>
      <LoginForm />
      <Link href="/" style={{ alignSelf: 'center', fontSize: 14, fontWeight: 600 }}>
        ← Вернуться на главную
      </Link>
    </AuthLayout>
  )
}
