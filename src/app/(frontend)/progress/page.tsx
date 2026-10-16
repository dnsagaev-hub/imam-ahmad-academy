import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { ProgressBody, ProgressHeader } from '@/components/progress/ProgressDashboard'
import { REGISTRATION_ENABLED } from '@/lib/config'
import { toLeanCourse } from '@/lib/learning'
import { getCourses } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Мой прогресс' }

export default async function ProgressPage() {
  // С включённой регистрацией прогресс живёт в личном кабинете
  if (REGISTRATION_ENABLED) redirect('/cabinet')
  const courses = (await getCourses()).map(toLeanCourse)
  return (
    <>
      <Header>
        <ProgressHeader courses={courses} />
      </Header>
      <ProgressBody courses={courses} />
      <Footer />
    </>
  )
}
