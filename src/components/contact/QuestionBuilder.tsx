'use client'

import { useMemo, useState } from 'react'

/*
 * Помощник «составить вопрос». Ничего не отправляет на сайт и ничего не сохраняет:
 * собирает текст, который человек копирует и сам отправляет в Telegram или на почту.
 */

const TOPICS = [
  'Фикх (практический вопрос)',
  'Вероучение (акыда)',
  'Вопрос по уроку или курсу',
  'Книги и порядок изучения',
  'Работа сайта',
  'Другое',
]

export function QuestionBuilder({ telegram, email }: { telegram?: string | null; email?: string | null }) {
  const [topic, setTopic] = useState(TOPICS[0])
  const [lesson, setLesson] = useState('')
  const [question, setQuestion] = useState('')
  const [context, setContext] = useState('')
  const [publishOk, setPublishOk] = useState(true)
  const [copied, setCopied] = useState(false)

  const isFiqh = topic.startsWith('Фикх')
  const isLesson = topic.startsWith('Вопрос по уроку')

  const text = useMemo(() => {
    const lines = ['Ас-саляму алейкум!', '', `Тема: ${topic}`]
    if (isLesson && lesson.trim()) lines.push(`Урок: ${lesson.trim()}`)
    lines.push('', 'Вопрос:', question.trim() || '…')
    if (context.trim()) lines.push('', isFiqh ? 'Обстоятельства:' : 'Подробности:', context.trim())
    lines.push('', publishOk ? 'Можно опубликовать разбор без моего имени.' : 'Прошу не публиковать.')
    return lines.join('\n')
  }, [topic, lesson, question, context, publishOk, isFiqh, isLesson])

  const ready = question.trim().length >= 10

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2500)
  }

  const mailto = email
    ? `mailto:${email}?subject=${encodeURIComponent(`Вопрос: ${topic}`)}&body=${encodeURIComponent(text)}`
    : null

  return (
    <div className="qb">
      <div className="qb-form">
        <label className="field">
          <span>Тема</span>
          <select className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        {isLesson ? (
          <label className="field">
            <span>Какой урок</span>
            <input className="input" value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="Например: «Виды воды», курс «Фикх очищения»" />
          </label>
        ) : null}
        <label className="field">
          <span>Ваш вопрос</span>
          <textarea
            className="input"
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Один вопрос — одно сообщение. Сформулируйте, что именно хотите узнать."
          />
        </label>
        <label className="field">
          <span>{isFiqh ? 'Обстоятельства (что произошло, когда, где)' : 'Подробности (по желанию)'}</span>
          <textarea
            className="input"
            rows={3}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={isFiqh ? 'Например: был в поездке, вода только холодная, согреть негде…' : ''}
          />
        </label>
        <label className="check">
          <input type="checkbox" checked={publishOk} onChange={(e) => setPublishOk(e.target.checked)} />
          <span>Можно опубликовать разбор на сайте без моего имени</span>
        </label>
      </div>

      <div className="qb-preview">
        <div className="qb-preview-head">
          <span className="tl-label">Готовое сообщение</span>
          <span className="muted" style={{ fontSize: 13 }}>
            Сайт его не отправляет и не сохраняет
          </span>
        </div>
        <pre className="qb-text">{text}</pre>
        <div className="qb-actions">
          <button type="button" className="btn" onClick={copy} disabled={!ready}>
            {copied ? '✓ Скопировано' : 'Скопировать текст'}
          </button>
          {telegram ? (
            <a
              href={telegram}
              target="_blank"
              rel="noopener"
              className={`btn btn-outline${ready ? '' : ' is-disabled'}`}
              aria-disabled={!ready}
              onClick={() => ready && copy()}
            >
              Скопировать и открыть Telegram
            </a>
          ) : null}
          {mailto ? (
            <a href={ready ? mailto : undefined} className={`btn btn-ghost${ready ? '' : ' is-disabled'}`} aria-disabled={!ready}>
              Отправить письмом
            </a>
          ) : null}
        </div>
        {!ready ? <p className="muted" style={{ margin: 0, fontSize: 13 }}>Напишите вопрос — хотя бы одно предложение.</p> : null}
      </div>
    </div>
  )
}
