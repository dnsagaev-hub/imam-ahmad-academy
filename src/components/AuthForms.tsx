'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

async function login(email: string, password: string) {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return res.ok
}

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        setPending(true)
        setError(null)
        const ok = await login(String(fd.get('email')), String(fd.get('password')))
        setPending(false)
        if (!ok) return setError('Неверный email или пароль.')
        router.push('/cabinet')
        router.refresh()
      }}
    >
      <h1 className="page-title" style={{ fontSize: 42 }}>
        С возвращением
      </h1>
      <p className="muted" style={{ margin: '0 0 10px' }}>
        Войдите, чтобы продолжить с того места, где остановились.
      </p>
      <label htmlFor="l-email">Email</label>
      <input id="l-email" name="email" type="email" className="input" autoComplete="email" required />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label htmlFor="l-pass">Пароль</label>
        <Link href="/forgot" style={{ fontSize: 14, fontWeight: 600 }}>
          Забыли пароль?
        </Link>
      </div>
      <input id="l-pass" name="password" type="password" className="input" autoComplete="current-password" required />
      {error ? <p className="notice notice-err">{error}</p> : null}
      <button type="submit" className="btn btn-lg" disabled={pending}>
        {pending ? 'Входим…' : 'Войти'}
      </button>
      <p className="muted" style={{ textAlign: 'center', margin: 0 }}>
        Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
      </p>
    </form>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const name = String(fd.get('name') ?? '').trim()
        const email = String(fd.get('email') ?? '').trim()
        const password = String(fd.get('password') ?? '')
        if (password.length < 8) return setError('Пароль должен быть не короче 8 символов.')
        if (fd.get('consent') !== 'on') return setError('Нужно согласие на обработку персональных данных.')
        setPending(true)
        setError(null)
        const res = await fetch('/api/users', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        })
        if (!res.ok) {
          setPending(false)
          return setError('Не удалось зарегистрироваться. Возможно, этот email уже занят — попробуйте войти.')
        }
        await login(email, password)
        setPending(false)
        router.push('/cabinet')
        router.refresh()
      }}
    >
      <h1 className="page-title" style={{ fontSize: 42 }}>
        Начать обучение
      </h1>
      <p className="muted" style={{ margin: '0 0 10px' }}>
        Регистрация бесплатна и занимает минуту.
      </p>
      <label htmlFor="r-name">Имя</label>
      <input id="r-name" name="name" className="input" autoComplete="given-name" required maxLength={80} />
      <label htmlFor="r-email">Email</label>
      <input id="r-email" name="email" type="email" className="input" autoComplete="email" required />
      <label htmlFor="r-pass">Пароль</label>
      <input id="r-pass" name="password" type="password" className="input" autoComplete="new-password" minLength={8} required />
      <span className="muted" style={{ fontSize: 13 }}>
        Не меньше 8 символов
      </span>
      <label className="check">
        <input type="checkbox" name="consent" required />
        <span>
          Я согласен на обработку персональных данных и принимаю <Link href="/privacy">политику конфиденциальности</Link>
        </span>
      </label>
      {error ? <p className="notice notice-err">{error}</p> : null}
      <button type="submit" className="btn btn-lg" disabled={pending}>
        {pending ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
      </button>
      <p className="muted" style={{ textAlign: 'center', margin: 0 }}>
        Уже есть аккаунт? <Link href="/login">Войти</Link>
      </p>
    </form>
  )
}

export function ForgotForm() {
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)
  if (sent)
    return (
      <p className="notice notice-ok">
        Если такой email зарегистрирован, на него придёт письмо со ссылкой для смены пароля.
      </p>
    )
  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        setPending(true)
        await fetch('/api/users/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: String(fd.get('email')) }),
        }).catch(() => null)
        setPending(false)
        setSent(true)
      }}
    >
      <h1 className="page-title" style={{ fontSize: 42 }}>
        Восстановить пароль
      </h1>
      <label htmlFor="f-email">Email</label>
      <input id="f-email" name="email" type="email" className="input" autoComplete="email" required />
      <button type="submit" className="btn btn-lg" disabled={pending}>
        Отправить ссылку
      </button>
      <Link href="/login" style={{ textAlign: 'center' }}>
        ← Вернуться ко входу
      </Link>
    </form>
  )
}

export function LogoutButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      className="btn btn-outline"
      onClick={async () => {
        await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
        router.push('/')
        router.refresh()
      }}
    >
      Выйти
    </button>
  )
}
