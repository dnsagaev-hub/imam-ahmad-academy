import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RegistryTable } from '@/components/arabic/RegistryTable'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { isAdminUser } from '@/access'
import { verbForms } from '@/lib/arabic'
import { buildArabicCourse, wordUsage } from '@/lib/arabicCourse'
import { getCurrentUser } from '@/lib/payload'
import { getCourseBySlug } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  return { title: course ? `Словарь курса — ${course.title}` : 'Словарь курса' }
}

/** Словарь курса арабского: все слова по урокам, корень, тема и где слово повторяется дальше. */
export default async function CourseWordsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) notFound()
  const ac = buildArabicCourse(course)
  if (!ac.lessons.length) notFound()
  const usage = wordUsage(ac)
  // Проверка закрытого словаря и «мало повторов» — подсказки автору, видны только администратору
  const admin = isAdminUser(await getCurrentUser())

  const rows = ac.words.map((w) => ({
    key: w.key,
    word: w.word,
    translation: w.translation,
    root: w.root,
    forms: [w.plural, verbForms(w), w.forms].filter(Boolean).join(' · ') || undefined,
    tag: w.tag,
    theme: w.theme,
    lesson: w.lesson,
    lessonSlug: w.lessonSlug,
    repeats: usage.repeats.get(w.key) ?? [],
  }))
  const unknown = ac.lessons.filter((l) => usage.unknown.has(l.number))

  return (
    <>
      <Header />
      <PageHead
        crumbs={[
          { label: 'Курсы', href: '/courses' },
          { label: course.title, href: `/courses/${course.slug}` },
          { label: 'Словарь курса' },
        ]}
        eyebrow="Сквозной реестр слов"
        title="Словарь курса"
        lead="Все слова курса по порядку уроков: корень, формы, перевод, тема, урок, где слово введено, и в каких уроках оно потом повторяется."
      >
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn" href={`/courses/${course.slug}/kartochki`}>
            Карточки для повторения
          </Link>
          <Link className="btn btn-outline" href={`/courses/${course.slug}`}>
            Программа курса
          </Link>
        </div>
      </PageHead>
      <main className="container section" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {rows.length ? <RegistryTable rows={rows} showLow={admin} /> : <div className="empty">Слова появятся, когда в уроках будет заполнен словарь.</div>}

        {admin ? (
          <section className="card card-pad reg-check" id="check">
            <h2 className="h2" style={{ fontSize: 30, margin: '0 0 6px' }}>
              Проверка закрытого словаря
            </h2>
            <p className="muted" style={{ margin: '0 0 12px' }}>
              Видно только администратору. Слова из предложений, текста и заданий урока, которых нет в словаре этого и прошлых уроков.
              Сайт узнаёт слово и с приставками и окончаниями (و، ب، ال، ـه، ـون…), но редкую форму может не узнать — тогда впишите её в «Другие формы» у слова.
              Повторы меньше 5 в таблице выделены.
            </p>
            {unknown.length ? (
              <ul className="reg-unknown">
                {unknown.map((l) => (
                  <li key={l.number}>
                    <Link href={`/lessons/${l.slug}`}>Урок {l.number}</Link>:{' '}
                    <span className="ar" lang="ar" dir="rtl">
                      {usage.unknown.get(l.number)!.join('، ')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="notice notice-ok" style={{ margin: 0 }}>
                Незнакомых слов не найдено: во всех уроках только слова из словаря.
              </p>
            )}
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  )
}
