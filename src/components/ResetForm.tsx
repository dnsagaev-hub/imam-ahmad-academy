'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ResetForm({ token }: { token: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const password = String(fd.get('password') ?? '')
        if (password.length < 8) return setError('Пароль должен быть не короче 8 символов.')
        if (password !== String(fd.get('password2') ?? '')) return setError('Пароли не совпадают.')
        setPending(true)
        const res = await fetch('/api/users/reset-password', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        })
        setPending(false)
        if (!res.ok) return setError('Ссылка устарела или неверна. Запросите смену пароля ещё раз.')
        router.push('/cabinet')
        router.refresh()
      }}
    >
      <h1 className="page-title" style={{ fontSize: 42 }}>
        Новый пароль
      </h1>
      <label htmlFor="n-pass">Новый пароль</label>
      <input id="n-pass" name="password" type="password" className="input" autoComplete="new-password" minLength={8} required />
      <label htmlFor="n-pass2">Повторите пароль</label>
      <input id="n-pass2" name="password2" type="password" className="input" autoComplete="new-password" minLength={8} required />
      {error ? <p className="notice notice-err">{error}</p> : null}
      <button type="submit" className="btn btn-lg" disabled={pending}>
        Сохранить пароль
      </button>
    </form>
  )
}
