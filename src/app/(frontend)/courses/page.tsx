import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { groupByStage, StageCards, StageSection } from '@/components/program/Program'
import { COURSE_LEVELS } from '@/lib/constants'
import { getCourses } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Курсы — программа обучения',
  description: 'Четыре ступени изучения ханбалитского мазхаба: дисциплины, учебники и объём изучения.',
}

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const { level } = await searchParams
  const stage = COURSE_LEVELS.find((l) => l.value === level)
  const courses = await getCourses()
  const groups = groupByStage(courses).filter((g) => !stage || g.stage.value === stage.value)
  const total = courses.length

  return (
    <>
      <Header />
      <PageHead
        crumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Курсы', href: stage ? '/courses' : undefined },
          ...(stage ? [{ label: `${stage.roman}. ${stage.label} ступень` }] : []),
        ]}
        eyebrow="Курсы · единая учебная программа"
        title={stage ? `${stage.name} — ${stage.label.toLowerCase()} ступень` : 'Четыре ступени изучения мазхаба'}
        lead={
          stage
            ? stage.about
            : `Программа ведёт от первого знакомства с исламскими науками до классических комментариев: ${total} дисциплин, утверждённые учебники и объём изучения. Внутри курса уроки идут по порядку, после каждого — тест.`
        }
      />

      <main className="container section" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <StageCards courses={courses} current={stage?.value} />

        {stage ? (
          <p style={{ margin: '-24px 0 0' }}>
            <Link href="/courses" style={{ fontWeight: 700 }}>
              ← Вся программа
            </Link>
          </p>
        ) : null}

        {groups.map((g) => (
          <StageSection key={g.stage.value} stage={g.stage} courses={g.courses} />
        ))}

        <aside className="program-notes">
          <p>
            <b>Как читать программу.</b> «Полностью» — изучается весь матн или учебник. «Выборочно» — отдельные суры,
            аяты, главы или фрагменты по календарному плану. <span className="disc-status disc-status-draft">◆ пособие в разработке</span>{' '}
            — материал преподавателей, который ещё готовится. <span className="disc-status disc-status-working">◆ рабочий выбор</span>{' '}
            — книга в плане, окончательное решение ещё не принято.
          </p>
          <p>
            Чтение, заучивание и повторение Корана (التلاوة والحفظ والمراجعة) не выделено в отдельную дисциплину: это
            сквозная работа на всех ступенях.
          </p>
        </aside>
      </main>
      <Footer />
    </>
  )
}
