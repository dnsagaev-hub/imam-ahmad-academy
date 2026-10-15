'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { sendMessage } from '@/app/(frontend)/actions'

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, null as null | { ok: boolean; message: string })

  if (state?.ok) return <p className="notice notice-ok">{state.message}</p>

  return (
    <form action={action} className="form">
      <label htmlFor="c-name">Имя</label>
      <input id="c-name" name="name" className="input" autoComplete="name" required />
      <label htmlFor="c-email">Email</label>
      <input id="c-email" name="email" type="email" className="input" autoComplete="email" required />
      <label htmlFor="c-topic">Тема</label>
      <select id="c-topic" name="topic" className="input">
        <option>Вопрос по фикху</option>
        <option>Вопрос по уроку</option>
        <option>Работа сайта</option>
      </select>
      <label htmlFor="c-text">Ваш вопрос</label>
      <textarea id="c-text" name="text" className="input" rows={4} required />
      <label className="check">
        <input type="checkbox" name="consent" required />
        <span>
          Согласен на обработку персональных данных согласно <Link href="/privacy">политике конфиденциальности</Link>
        </span>
      </label>
      {state && !state.ok ? <p className="notice notice-err">{state.message}</p> : null}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'Отправляем…' : 'Отправить'}
      </button>
    </form>
  )
}
