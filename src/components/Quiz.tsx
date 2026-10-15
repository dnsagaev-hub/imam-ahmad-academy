'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { checkAnswer, submitQuiz } from '@/app/(frontend)/actions'

type Q = { question: string; options: string[] }

type Result = Awaited<ReturnType<typeof submitQuiz>>

const LETTERS = ['А', 'Б', 'В', 'Г', 'Д', 'Е']

export function Quiz({
  lessonId,
  lessonNumber,
  questions,
  passingScore,
  loggedIn,
  nextHref,
  nextLabel,
  previousAttempts,
}: {
  lessonId: string | number
  lessonNumber?: number
  questions: Q[]
  passingScore: number
  loggedIn: boolean
  nextHref?: string
  nextLabel?: string
  previousAttempts: number
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [q, setQ] = useState(0)
  const [sel, setSel] = useState<number | null>(null)
  const [checked, setChecked] = useState<null | { isCorrect: boolean; correctIndex: number; explanation: string }>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [results, setResults] = useState<boolean[]>([])
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cur = questions[q]
  const isLast = q === questions.length - 1

  const onCheck = () => {
    if (sel === null) return
    setError(null)
    start(async () => {
      const r = await checkAnswer(lessonId, q, sel)
      if (!r.ok) return setError(r.error)
      setChecked({ isCorrect: r.isCorrect, correctIndex: r.correctIndex, explanation: r.explanation })
    })
  }

  const onNext = () => {
    if (sel === null || !checked) return
    const nextAnswers = [...answers, sel]
    const nextResults = [...results, checked.isCorrect]
    setAnswers(nextAnswers)
    setResults(nextResults)
    if (!isLast) {
      setQ(q + 1)
      setSel(null)
      setChecked(null)
      return
    }
    start(async () => {
      const r = await submitQuiz(lessonId, nextAnswers)
      if (!r.ok) return setError(r.error)
      setResult(r)
      router.refresh()
    })
  }

  const retry = () => {
    setQ(0)
    setSel(null)
    setChecked(null)
    setAnswers([])
    setResults([])
    setResult(null)
    setError(null)
  }

  const attemptNo = result && result.ok ? result.attempt : previousAttempts + 1

  return (
    <section id="test" className="card quiz" aria-live="polite">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h2 className="h2" style={{ margin: '0 0 4px', fontSize: 34 }}>
            Тест{lessonNumber ? ` к уроку ${lessonNumber}` : ''}
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>
            Проходной балл {passingScore}% · попытка {attemptNo}
          </p>
        </div>
        <div className="dots" aria-hidden="true">
          {questions.map((_, i) => (
            <span
              key={i}
              className={
                i < results.length ? (results[i] ? 'ok' : 'bad') : i === q && !result ? 'cur' : ''
              }
            />
          ))}
        </div>
      </div>

      {!result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="tag">
            Вопрос {q + 1} из {questions.length}
          </div>
          <div className="q-text">{cur.question}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} role="radiogroup" aria-label="Варианты ответа">
            {cur.options.map((text, i) => {
              let cls = 'opt'
              if (checked) {
                if (i === checked.correctIndex) cls += ' right'
                else if (i === sel) cls += ' wrong'
                else cls += ' dim'
              } else if (i === sel) cls += ' sel'
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={i === sel}
                  className={cls}
                  disabled={Boolean(checked)}
                  onClick={() => setSel(i)}
                >
                  <span className="l">{LETTERS[i]}</span>
                  <span style={{ flex: 1 }}>{text}</span>
                </button>
              )
            })}
          </div>

          {checked ? (
            <div className={`feedback ${checked.isCorrect ? 'good' : 'bad'}`}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: checked.explanation ? 6 : 0 }}>
                {checked.isCorrect ? 'Верно!' : 'Неверно'}
              </div>
              {checked.explanation ? <div style={{ fontSize: 15, lineHeight: 1.6 }}>{checked.explanation}</div> : null}
            </div>
          ) : null}

          {error ? <p className="notice notice-err">{error}</p> : null}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {!checked ? (
              <button type="button" className="btn" onClick={onCheck} disabled={sel === null || pending}>
                {pending ? 'Проверяем…' : 'Ответить'}
              </button>
            ) : (
              <button type="button" className="btn" onClick={onNext} disabled={pending}>
                {pending ? 'Сохраняем…' : isLast ? 'Завершить тест' : 'Следующий вопрос →'}
              </button>
            )}
          </div>
        </div>
      ) : result.ok ? (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center' }}>
            <div className={`ring ${result.passed ? 'pass' : 'fail'}`}>
              <b>{result.score}%</b>
              <span style={{ fontSize: 13 }}>
                {result.correctCount} из {result.total} верно
              </span>
            </div>
            <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--navy)' }}>
                {result.passed ? (nextHref ? 'Тест сдан — следующий урок открыт' : 'Тест сдан') : 'Тест не сдан'}
              </div>
              <div style={{ fontSize: 16, color: 'var(--muted)' }}>
                {result.passed
                  ? result.saved
                    ? 'Результат сохранён в личном кабинете. Тест можно пройти ещё раз, чтобы улучшить балл.'
                    : 'Войдите или зарегистрируйтесь, чтобы результаты сохранялись и открывались следующие уроки.'
                  : `Нужно набрать не меньше ${result.passing}%. Пересмотрите урок и конспект, затем попробуйте снова.`}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                {result.passed && nextHref && loggedIn ? (
                  <Link href={nextHref} className="btn">
                    {nextLabel ?? 'Следующий урок'} →
                  </Link>
                ) : null}
                {!loggedIn ? (
                  <Link href="/register" className="btn">
                    Зарегистрироваться
                  </Link>
                ) : null}
                <button type="button" className="btn btn-outline" onClick={retry}>
                  Пройти заново
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--line-soft)', paddingTop: 18 }}>
            <div className="tag" style={{ color: 'var(--muted)' }}>
              Разбор ответов
            </div>
            {result.review.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.5 }}>
                <span className="mark" style={{ background: r.isCorrect ? 'var(--royal)' : 'var(--red)' }} aria-label={r.isCorrect ? 'Верно' : 'Неверно'}>
                  {r.isCorrect ? '✓' : '✕'}
                </span>
                <span>
                  <strong>{r.question}</strong> — {r.correctText}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
