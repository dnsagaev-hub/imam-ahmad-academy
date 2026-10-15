'use client'

import { useActionState } from 'react'

import { updateProfile } from '@/app/(frontend)/actions'

export function ProfileForm({ name, email, notify }: { name: string; email: string; notify: boolean }) {
  const [state, action, pending] = useActionState(updateProfile, null as null | { ok: boolean; message: string })
  return (
    <form action={action} className="form">
      <label htmlFor="p-name">Имя</label>
      <input id="p-name" name="name" className="input" defaultValue={name} maxLength={80} required />
      <label htmlFor="p-email">Email</label>
      <input id="p-email" className="input" value={email} readOnly disabled />
      <label className="check" style={{ minHeight: 44, alignItems: 'center' }}>
        <input type="checkbox" name="notify" defaultChecked={notify} style={{ marginTop: 0 }} />
        <span>Уведомлять о новых уроках</span>
      </label>
      {state ? <p className={`notice ${state.ok ? 'notice-ok' : 'notice-err'}`}>{state.message}</p> : null}
      <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }} disabled={pending}>
        Сохранить
      </button>
    </form>
  )
}
