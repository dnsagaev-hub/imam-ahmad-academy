import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/AuthForms'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { ProfileForm } from '@/components/ProfileForm'
import { REGISTRATION_ENABLED } from '@/lib/config'
import { COURSE_LEVELS, STUDENT_LEVELS, labelOf } from '@/lib/constants'
import { courseState, getProgress, studentLevel } from '@/lib/learning'
import { getCurrentUser, getPayloadClient } from '@/lib/payload'
import { getCourses } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Личный кабинет' }

const TABS = [
  { key: 'overview', label: 'Обзор' },
  { key: 'tests', label: 'История тестов' },
  { key: 'settings', label: 'Настройки' },
] as const

const LEVEL_RULES = [
  'Начинающий: с первого урока.',
  'Средний: все курсы начального уровня и средний балл не ниже 80%.',
  'Продвинутый: курсы среднего уровня и хотя бы один продвинутый курс.',
]

export default async function CabinetPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  if (!REGISTRATION_ENABLED) redirect('/progress')
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const { tab: rawTab } = await searchParams
  const tab = TABS.some((t) => t.key === rawTab) ? rawTab : 'overview'

  const payload = await getPayloadClient()
  const [progress, courses] = await Promise.all([getProgress(payload, user.id), getCourses()])
  const level = studentLevel(courses, progress)
  const states = courses.map((c) => ({ c, s: courseState(c, progress) })).filter((x) => x.s.total > 0)
  const started = states.filter((x) => x.s.doneCount > 0)
  const notStarted = states.filter((x) => x.s.doneCount === 0)
  const myCourses = [...started.sort((a, b) => Number(a.s.completed) - Number(b.s.completed)), ...notStarted.slice(0, 3)]
  const name = user.name || user.email
  const since = user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : null

  return (
    <>
      <Header>
        <div className="container cab-head">
          <div style={{ flex: '1 1 460px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 22 }}>
            <span className="big-avatar">{name.charAt(0).toUpperCase()}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 15, color: '#A8DCC6' }}>Ас-саляму ‘алейкум,</span>
              <h1 className="display" style={{ margin: 0, fontSize: 48, lineHeight: 1, fontWeight: 700 }}>
                {name}
              </h1>
              <span style={{ fontSize: 14, color: '#E6F5EE' }}>
                {since ? `Ученик с ${since} · ` : ''}Уровень:{' '}
                <strong style={{ color: 'var(--gold-light)' }}>{STUDENT_LEVELS[level.index].name}</strong>
              </span>
            </div>
          </div>
          <div className="stat-tiles">
            <div>
              <b>{progress.passed.size}</b>
              <small>уроков пройдено</small>
            </div>
            <div>
              <b>{level.averageScore !== null ? `${level.averageScore}%` : '—'}</b>
              <small>средний балл</small>
            </div>
            <div>
              <b>{level.completedCourses}</b>
              <small>курсов завершено</small>
            </div>
            <div>
              <b>{progress.history.length}</b>
              <small>попыток тестов</small>
            </div>
          </div>
        </div>
      </Header>

      <div className="container">
        <nav className="tabs" aria-label="Разделы кабинета">
          {TABS.map((t) => (
            <Link key={t.key} href={t.key === 'overview' ? '/cabinet' : `/cabinet?tab=${t.key}`} className={tab === t.key ? 'on' : ''} aria-current={tab === t.key ? 'page' : undefined}>
              {t.label}
            </Link>
          ))}
          {user.role === 'admin' ? (
            <a href="/admin" style={{ marginLeft: 'auto' }}>
              Админка →
            </a>
          ) : null}
        </nav>
      </div>

      <main className="container" style={{ padding: '32px 24px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {tab === 'overview' ? (
          <>
            <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div className="section-head" style={{ marginBottom: 0 }}>
                <div>
                  <h2 className="h2" style={{ margin: '0 0 4px', fontSize: 34 }}>
                    Шкала успеха
                  </h2>
                  {level.index < 2 ? (
                    <p className="muted" style={{ margin: 0 }}>
                      До уровня «{STUDENT_LEVELS[level.index + 1].name}» — {level.toNextPercent}% пути
                    </p>
                  ) : (
                    <p className="muted" style={{ margin: 0 }}>Высший уровень академии, ма ша Аллах!</p>
                  )}
                </div>
              </div>
              <div className="levels">
                {STUDENT_LEVELS.map((lv, i) => {
                  const cls = i === level.index ? 'now' : i < level.index ? 'past' : i === level.index + 1 ? 'next' : 'later'
                  const tag = i === level.index ? 'Текущий' : i < level.index ? 'Пройден' : i === level.index + 1 ? `${level.toNextPercent}%` : 'Закрыт'
                  const barWidth = i <= level.index ? 100 : i === level.index + 1 ? level.toNextPercent : 0
                  return (
                    <div key={lv.key} className={`level ${cls}`}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span className="ar" lang="ar" style={{ fontSize: 26, fontWeight: 700 }}>
                          {lv.ar}
                        </span>
                        <span className="lv-tag">{tag}</span>
                      </div>
                      <div className="nm">{lv.name}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.55, opacity: 0.85 }}>{LEVEL_RULES[i]}</div>
                      <div className="bar" style={{ height: 6, background: 'rgba(0,112,79,.15)' }}>
                        <div style={{ width: `${barWidth}%`, background: i === level.index ? 'var(--gold-light)' : 'var(--royal)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="h2" style={{ margin: 0, fontSize: 34 }}>
                Мои курсы
              </h2>
              {myCourses.length ? (
                <div className="grid grid-320">
                  {myCourses.map(({ c, s }) => (
                    <article key={c.id} className="card card-pad lift" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span className="badge">{labelOf(COURSE_LEVELS, c.level)}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>
                          {s.completed ? 'Завершён' : s.doneCount ? 'В процессе' : 'Не начат'}
                        </span>
                      </div>
                      <h3 className="display" style={{ margin: 0, fontSize: 25, lineHeight: 1.2, color: 'var(--navy)' }}>
                        {c.title}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)' }}>
                        <span>
                          {s.doneCount} из {s.total} уроков
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{s.percent}%</span>
                      </div>
                      <div className="bar">
                        <div style={{ width: `${s.percent}%`, background: s.completed ? 'var(--royal)' : undefined }} />
                      </div>
                      {s.currentLesson ? (
                        <Link href={`/lessons/${s.currentLesson.lesson.slug}`} className={`btn ${s.doneCount ? '' : 'btn-outline'}`} style={{ marginTop: 4 }}>
                          {s.doneCount ? `Продолжить: урок ${s.currentLesson.number}` : 'Начать курс'}
                        </Link>
                      ) : (
                        <Link href={`/courses/${c.slug}`} className="btn btn-outline" style={{ marginTop: 4 }}>
                          Открыть курс
                        </Link>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="empty">
                  Вы ещё не начали ни одного курса. <Link href="/courses">Выбрать курс →</Link>
                </p>
              )}
            </section>
          </>
        ) : null}

        {tab === 'tests' ? (
          <section className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="section-head" style={{ marginBottom: 0 }}>
              <h2 className="h2" style={{ margin: 0, fontSize: 34 }}>
                История тестов
              </h2>
              <span className="muted">
                Средний балл: <strong style={{ color: 'var(--navy)' }}>{level.averageScore !== null ? `${level.averageScore}%` : '—'}</strong>
              </span>
            </div>
            {progress.history.length ? (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Урок</th>
                      <th>Курс</th>
                      <th className="r">Балл</th>
                      <th className="r">Попытка</th>
                      <th className="r">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progress.history.map((h) => (
                      <tr key={String(h.id)}>
                        <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{h.lessonTitle}</td>
                        <td className="muted">{h.courseTitle || '—'}</td>
                        <td className="r">
                          <span
                            className="score-pill"
                            style={h.passed ? (h.score >= 90 ? { background: 'var(--navy)', color: '#fff' } : undefined) : { background: 'var(--red-bg)', color: 'var(--red)' }}
                          >
                            {h.score}%
                          </span>
                        </td>
                        <td className="r muted">{h.attempt}</td>
                        <td className="r muted">{new Date(h.createdAt).toLocaleDateString('ru-RU')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty">Здесь появятся результаты ваших тестов.</p>
            )}
          </section>
        ) : null}

        {tab === 'settings' ? (
          <section className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 }}>
            <h2 className="h2" style={{ margin: '0 0 6px', fontSize: 34 }}>
              Настройки
            </h2>
            <ProfileForm name={user.name ?? ''} email={user.email} notify={user.notifyNewLessons !== false} />
            <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/forgot" className="btn btn-outline">
                Сменить пароль
              </Link>
              <LogoutButton />
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  )
}
