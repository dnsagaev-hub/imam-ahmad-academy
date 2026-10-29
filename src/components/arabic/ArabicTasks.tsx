'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { checkArabicTask, submitArabicTasks, type TaskAnswer } from '@/app/(frontend)/actions'
import { addAttempt, useLocalProgress } from '@/lib/localProgress'
import { Bidi } from './Bidi'

/*
 * Задания урока арабского — по одному, как тест. «Выбрать ответ», «Вписать», «Соединить пары» и «Собрать предложение»
 * проверяет сервер; перевод, и‘раб и огласовку ученик сверяет с ключом и сам отмечает, верно ли.
 * Ключи хранятся на сервере и приходят только после ответа.
 */

export type ClientTask = {
  kind: string
  prompt: string
  material?: string
  options?: string[]
  left?: string[]
  right?: string[]
  chips?: string[]
  auto: boolean
}

type Checked = { isCorrect?: boolean; key: string; explanation: string }
type Result = Awaited<ReturnType<typeof submitArabicTasks>>

const LETTERS = ['А', 'Б', 'В', 'Г', 'Д', 'Е']
const AR = /[؀-ۿ]/

const dirOf = (s?: string) => (s && AR.test(s) && !/[а-яё]/i.test(s) ? 'rtl' : 'auto')

function Material({ text }: { text?: string }) {
  if (!text?.trim()) return null
  const ar = dirOf(text) === 'rtl'
  return (
    <div className={ar ? 'task-material ar' : 'task-material'} lang={ar ? 'ar' : undefined} dir={ar ? 'rtl' : 'auto'}>
      {ar ? text : <Bidi text={text} />}
    </div>
  )
}

export function ArabicTasks({
  lessonId,
  tasks,
  counts,
  passingScore,
  mode,
  loggedIn,
  lessonTitle,
  courseTitle,
  nextHref,
  nextLabel,
}: {
  lessonId: string | number
  tasks: ClientTask[]
  /** задания — тест урока (во вкладке «Тест» нет вопросов) */
  counts: boolean
  passingScore: number
  mode: 'server' | 'local'
  loggedIn: boolean
  lessonTitle: string
  courseTitle?: string
  nextHref?: string
  nextLabel?: string
}) {
  const router = useRouter()
  const local = useLocalProgress()
  const isLocal = mode === 'local'
  const [pending, start] = useTransition()
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<TaskAnswer[]>([])
  const [marks, setMarks] = useState<boolean[]>([])
  const [done, setDone] = useState<(boolean | null)[]>([])
  const [cur, setCur] = useState<TaskAnswer>({})
  const [checked, setChecked] = useState<Checked | null>(null)
  const [self, setSelf] = useState<boolean | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)

  const t = tasks[i]
  const isLast = i === tasks.length - 1
  const attempts = local.progress.attempts.get(String(lessonId)) ?? 0

  const ready =
    t &&
    (t.kind === 'choice'
      ? cur.choice !== undefined
      : t.kind === 'match'
        ? (t.left ?? []).every((_, k) => Boolean(cur.pairs?.[k]))
        : Boolean(cur.text?.trim()))

  const onCheck = () => {
    if (!ready) return
    setError(null)
    start(async () => {
      const r = await checkArabicTask(lessonId, i, cur)
      if (!r.ok) return setError(r.error)
      setChecked({ isCorrect: r.isCorrect, key: r.key, explanation: r.explanation })
    })
  }

  const correctNow = t?.auto ? Boolean(checked?.isCorrect) : Boolean(self)

  const onNext = () => {
    if (!checked || (!t.auto && self === null)) return
    const nextAnswers = [...answers, cur]
    const nextMarks = [...marks, t.auto ? false : Boolean(self)]
    const nextDone = [...done, correctNow]
    setAnswers(nextAnswers)
    setMarks(nextMarks)
    setDone(nextDone)
    if (!isLast) {
      setI(i + 1)
      setCur({})
      setChecked(null)
      setSelf(null)
      return
    }
    start(async () => {
      const r = await submitArabicTasks(lessonId, nextAnswers, nextMarks)
      if (!r.ok) return setError(r.error)
      if (isLocal && r.counts) addAttempt({ lessonId: String(lessonId), lessonTitle, courseTitle, score: r.score, passed: r.passed })
      else if (r.saved) router.refresh()
      setResult(r)
    })
  }

  const retry = () => {
    setI(0)
    setAnswers([])
    setMarks([])
    setDone([])
    setCur({})
    setChecked(null)
    setSelf(null)
    setResult(null)
    setError(null)
  }

  const chipsLeft = (t?.chips ?? []).map((c, k) => ({ c, k })).filter(({ k }) => !orderPicked(cur).includes(k))

  return (
    <section id="tasks" className="card quiz" aria-live="polite">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h2 className="h2" style={{ margin: '0 0 4px', fontSize: 34 }}>
            Задания
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>
            {counts ? `Тест урока · проходной балл ${passingScore}%${isLocal ? ` · попытка ${attempts + (result ? 0 : 1)}` : ''}` : 'Тренировка перед контрольным тестом'}
          </p>
        </div>
        <div className={`dots${tasks.length > 10 ? ' dots-many' : ''}`} aria-hidden="true">
          {tasks.map((_, k) => (
            <span key={k} className={k < done.length ? (done[k] ? 'ok' : 'bad') : k === i && !result ? 'cur' : ''} />
          ))}
        </div>
      </div>

      {!result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="tag">
            Задание {i + 1} из {tasks.length}
          </div>
          <div className="q-text">{t.prompt}</div>
          <Material text={t.material} />

          {t.kind === 'choice' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} role="radiogroup" aria-label="Варианты ответа">
              {(t.options ?? []).map((text, k) => {
                let cls = 'opt'
                if (checked) cls += checked.key === text ? ' right' : k === cur.choice ? ' wrong' : ' dim'
                else if (k === cur.choice) cls += ' sel'
                return (
                  <button key={k} type="button" role="radio" aria-checked={k === cur.choice} className={cls} disabled={Boolean(checked)} onClick={() => setCur({ choice: k })}>
                    <span className="l">{LETTERS[k]}</span>
                    <span style={{ flex: 1 }} dir={dirOf(text)} className={dirOf(text) === 'rtl' ? 'ar opt-ar' : undefined}>
                      {text}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : t.kind === 'match' ? (
            <div className="task-match">
              {(t.left ?? []).map((l, k) => (
                <label key={k} className="task-pair">
                  <span dir={dirOf(l)} className={dirOf(l) === 'rtl' ? 'ar task-pair-ar' : undefined}>
                    {l}
                  </span>
                  <select
                    className="input"
                    value={cur.pairs?.[k] ?? ''}
                    disabled={Boolean(checked)}
                    onChange={(e) => {
                      const pairs = [...(cur.pairs ?? [])]
                      pairs[k] = e.target.value
                      setCur({ pairs })
                    }}
                  >
                    <option value="">— выберите —</option>
                    {(t.right ?? []).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          ) : t.kind === 'order' ? (
            <div className="task-order">
              <div className="task-order-line ar" lang="ar" dir="rtl" aria-label="Ваше предложение">
                {orderPicked(cur).length ? (
                  orderPicked(cur).map((k, n) => (
                    <button
                      key={n}
                      type="button"
                      className="chip"
                      disabled={Boolean(checked)}
                      onClick={() => setCur(withOrder(t, orderPicked(cur).filter((_, m) => m !== n)))}
                    >
                      {t.chips?.[k]}
                    </button>
                  ))
                ) : (
                  <span className="muted task-hint">Нажимайте на слова по порядку</span>
                )}
              </div>
              <div className="task-order-chips ar" lang="ar" dir="rtl">
                {chipsLeft.map(({ c, k }) => (
                  <button key={k} type="button" className="chip" disabled={Boolean(checked)} onClick={() => setCur(withOrder(t, [...orderPicked(cur), k]))}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : t.kind === 'input' ? (
            <input
              className="input"
              dir="auto"
              value={cur.text ?? ''}
              disabled={Boolean(checked)}
              onChange={(e) => setCur({ text: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && !checked && onCheck()}
              placeholder="Ваш ответ"
              aria-label="Ваш ответ"
            />
          ) : (
            <textarea
              className="input task-text"
              dir={t.kind === 'toRu' || t.kind === 'irab' ? 'auto' : 'rtl'}
              value={cur.text ?? ''}
              disabled={Boolean(checked)}
              onChange={(e) => setCur({ text: e.target.value })}
              placeholder={t.kind === 'vowel' ? 'Перепишите текст с огласовкой' : 'Ваш ответ'}
              aria-label="Ваш ответ"
              rows={3}
            />
          )}

          {checked ? (
            <div className={`feedback ${t.auto ? (checked.isCorrect ? 'good' : 'bad') : self === null ? '' : self ? 'good' : 'bad'}`}>
              {t.auto ? (
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{checked.isCorrect ? 'Верно!' : 'Неверно'}</div>
              ) : (
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Сверьте с ключом</div>
              )}
              {checked.key && (!t.auto || !checked.isCorrect || t.kind === 'match') ? (
                <div className="task-key" dir="auto">
                  <span className="muted">Ключ: </span>
                  <Bidi text={checked.key} />
                </div>
              ) : null}
              {checked.explanation ? <div style={{ fontSize: 15, lineHeight: 1.6, marginTop: 6 }}><Bidi text={checked.explanation} /></div> : null}
              {!t.auto ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  <button type="button" className={`chip${self === true ? ' active' : ''}`} onClick={() => setSelf(true)}>
                    Ответил верно
                  </button>
                  <button type="button" className={`chip${self === false ? ' active' : ''}`} onClick={() => setSelf(false)}>
                    Есть ошибки
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="notice notice-err">{error}</p> : null}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {!checked ? (
              <button type="button" className="btn" onClick={onCheck} disabled={!ready || pending}>
                {pending ? 'Проверяем…' : t.auto ? 'Ответить' : 'Сверить с ключом'}
              </button>
            ) : (
              <button type="button" className="btn" onClick={onNext} disabled={pending || (!t.auto && self === null)}>
                {pending ? 'Сохраняем…' : isLast ? 'Завершить' : 'Следующее задание →'}
              </button>
            )}
          </div>
        </div>
      ) : result.ok ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center' }}>
          <div className={`ring ${result.passed ? 'pass' : 'fail'}`}>
            <b>{result.score}%</b>
            <span style={{ fontSize: 13 }}>
              {result.correctCount} из {result.total} верно
            </span>
          </div>
          <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--navy)' }}>
              {!result.counts ? 'Задания выполнены' : result.passed ? (nextHref ? 'Урок пройден — следующий открыт' : 'Урок пройден') : 'Пока не хватает баллов'}
            </div>
            <div style={{ fontSize: 16, color: 'var(--muted)' }}>
              {!result.counts
                ? 'Теперь пройдите контрольный тест ниже.'
                : result.passed
                  ? isLocal
                    ? 'Результат сохранён на этом устройстве — его видно на странице «Мой прогресс».'
                    : result.saved
                      ? 'Результат сохранён в личном кабинете.'
                      : 'Войдите, чтобы результаты сохранялись и открывались следующие уроки.'
                  : `Нужно набрать не меньше ${result.passing}%. Повторите словарь и предложения урока и попробуйте снова.`}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
              {result.counts && result.passed && nextHref && (loggedIn || isLocal) ? (
                <Link href={nextHref} className="btn">
                  {nextLabel ?? 'Следующий урок'} →
                </Link>
              ) : null}
              <button type="button" className="btn btn-outline" onClick={retry}>
                Пройти заново
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

// «Собрать предложение»: выбранные слова хранятся номерами, на сервер уходит готовое предложение
function orderPicked(a: TaskAnswer): number[] {
  return a.picked ?? []
}

function withOrder(t: ClientTask, picked: number[]): TaskAnswer {
  const text = picked.map((k) => t.chips?.[k] ?? '').join(' ')
  return { text, picked }
}
