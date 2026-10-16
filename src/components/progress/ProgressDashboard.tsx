'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

import { COURSE_LEVELS, STUDENT_LEVELS, labelOf } from '@/lib/constants'
import { courseState, studentLevel, type CourseDoc } from '@/lib/learning'
import { clearProgress, downloadProgressFile, importProgress, useLocalProgress } from '@/lib/localProgress'

/* Страница «Мой прогресс» (режим без регистрации): всё берётся из браузера ученика. */

const LEVEL_RULES = [
  'Начинающий: с первого урока.',
  'Средний: все курсы начального уровня и средний балл не ниже 80%.',
  'Продвинутый: курсы среднего уровня и хотя бы один продвинутый курс.',
]

/** Тёмная шапка: уровень и цифры. */
export function ProgressHeader({ courses }: { courses: CourseDoc[] }) {
  const { progress, ready } = useLocalProgress()
  const level = studentLevel(courses, progress)
  const v = (x: string | number) => (ready ? x : '—')
  return (
    <div className="container cab-head">
      <div style={{ flex: '1 1 460px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 15, color: '#A8DCC6' }}>Ас-саляму ‘алейкум!</span>
        <h1 className="display" style={{ margin: 0, fontSize: 48, lineHeight: 1, fontWeight: 700 }}>
          Мой прогресс
        </h1>
        <span style={{ fontSize: 14, color: '#E6F5EE' }}>
          Уровень: <strong style={{ color: 'var(--gold-light)' }}>{STUDENT_LEVELS[level.index].name}</strong>
        </span>
      </div>
      <div className="stat-tiles">
        <div>
          <b>{v(progress.passed.size)}</b>
          <small>уроков пройдено</small>
        </div>
        <div>
          <b>{level.averageScore !== null ? `${level.averageScore}%` : '—'}</b>
          <small>средний балл</small>
        </div>
        <div>
          <b>{v(level.completedCourses)}</b>
          <small>курсов завершено</small>
        </div>
        <div>
          <b>{v(progress.history.length)}</b>
          <small>попыток тестов</small>
        </div>
      </div>
    </div>
  )
}

/** Основная часть: шкала успеха, мои курсы, история тестов, перенос прогресса. */
export function ProgressBody({ courses }: { courses: CourseDoc[] }) {
  const { progress, ready } = useLocalProgress()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const level = studentLevel(courses, progress)
  const states = courses.map((c) => ({ c, s: courseState(c, progress) })).filter((x) => x.s.total > 0)
  const started = states.filter((x) => x.s.doneCount > 0).sort((a, b) => Number(a.s.completed) - Number(b.s.completed))
  const notStarted = states.filter((x) => x.s.doneCount === 0)
  const myCourses = [...started, ...notStarted.slice(0, 3)]

  const download = () => {
    downloadProgressFile()
    setMsg({ ok: true, text: 'Файл сохранён. На другом устройстве откройте эту страницу и нажмите «Загрузить из файла».' })
  }

  const upload = async (file: File) => {
    const ok = importProgress(await file.text())
    setMsg(ok ? { ok: true, text: 'Прогресс загружен.' } : { ok: false, text: 'Не удалось прочитать файл. Выберите файл, сохранённый на этом сайте.' })
  }

  const reset = () => {
    if (window.confirm('Удалить весь прогресс на этом устройстве? Это нельзя отменить.')) {
      clearProgress()
      setMsg({ ok: true, text: 'Прогресс на этом устройстве удалён.' })
    }
  }

  return (
    <main className="container" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div className="notice notice-ok" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ flex: '1 1 360px' }}>
          Прогресс хранится <strong>только в этом браузере</strong> на этом устройстве. Чтобы продолжить на другом устройстве,
          сохраните его в файл и загрузите там.
        </span>
        <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={download} disabled={!ready}>
            Сохранить в файл
          </button>
          <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()}>
            Загрузить из файла
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) upload(f)
              e.target.value = ''
            }}
          />
        </span>
      </div>
      {msg ? <p className={`notice ${msg.ok ? 'notice-ok' : 'notice-err'}`} style={{ margin: 0 }}>{msg.text}</p> : null}

      <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div>
          <h2 className="h2" style={{ margin: '0 0 4px', fontSize: 34 }}>
            Шкала успеха
          </h2>
          <p className="muted" style={{ margin: 0 }}>
            {level.index < 2
              ? `До уровня «${STUDENT_LEVELS[level.index + 1].name}» — ${level.toNextPercent}% пути`
              : 'Высший уровень академии, ма ша Аллах!'}
          </p>
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
              <article key={String(c.id)} className="card card-pad lift" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            Курсы скоро появятся. <Link href="/courses">Все курсы →</Link>
          </p>
        )}
      </section>

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
          <p className="empty">{ready ? 'Здесь появятся результаты ваших тестов.' : 'Загружаем…'}</p>
        )}
        {progress.history.length ? (
          <button type="button" className="btn btn-outline" style={{ alignSelf: 'flex-start' }} onClick={reset}>
            Начать заново на этом устройстве
          </button>
        ) : null}
      </section>
    </main>
  )
}
