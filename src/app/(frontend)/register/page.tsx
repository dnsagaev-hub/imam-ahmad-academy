import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { RegisterForm } from '@/components/AuthForms'
import { AuthLayout } from '@/components/AuthLayout'
import { getCurrentUser } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Регистрация' }

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect('/cabinet')
  return (
    <AuthLayout>
      <RegisterForm />
      <Link href="/" style={{ alignSelf: 'center', fontSize: 14, fontWeight: 600 }}>
        ← Вернуться на главную
      </Link>
    </AuthLayout>
  )
}
