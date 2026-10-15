import type { Metadata } from 'next'

import { CourseCard } from '@/components/Cards'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { FilterChips, PageHead } from '@/components/PageHead'
import { COURSE_LEVELS, labelOf } from '@/lib/constants'
import { getCourses } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Курсы' }

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const { level } = await searchParams
  const valid = COURSE_LEVELS.some((l) => l.value === level) ? level : undefined
  const courses = await getCourses(valid)

  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Курсы', href: valid ? '/courses' : undefined }, ...(valid ? [{ label: labelOf(COURSE_LEVELS, valid) }] : [])]}
        eyebrow="Курсы"
        title={valid ? `${labelOf(COURSE_LEVELS, valid)} уровень` : 'Три ступени обучения'}
        lead="Курсы проходятся по порядку: после каждого урока — тест, следующий урок открывается после его сдачи."
      />
      <main className="container section">
        <FilterChips base="/courses" param="level" options={COURSE_LEVELS} current={valid} allLabel="Все уровни" />
        {courses.length ? (
          <div className="grid grid-280">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <p className="empty">На этом уровне курсов пока нет.</p>
        )}
      </main>
      <Footer />
    </>
  )
}
