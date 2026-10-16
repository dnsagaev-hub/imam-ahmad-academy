import Link from 'next/link'

import { REGISTRATION_ENABLED } from '@/lib/config'
import { getCurrentUser } from '@/lib/payload'

import { Pattern } from './Icons'
import { NavMenu } from './NavMenu'

export function Brand() {
  return (
    <Link href="/" className="brand">
      <span className="brand-mark">
        <span lang="ar">أحمد</span>
      </span>
      <span>
        <span className="brand-name">Академия имама Ахмада</span>
        <span className="brand-sub">Онлайн-школа ханбалитского фикха</span>
      </span>
    </Link>
  )
}

export function Quote() {
  return (
    <figure className="quote">
      <p className="quote-ar" lang="ar" dir="rtl">
        مع المحبرة إلى المقبرة
      </p>
      <figcaption>
        <span className="quote-ru">«С пером — до могилы»</span>
        <span className="quote-by">Имам Ахмад ибн Ханбаль</span>
      </figcaption>
    </figure>
  )
}

/** Шапка сайта. `children` — содержимое под меню (например, главный экран или шапка кабинета). */
export async function Header({ children }: { children?: React.ReactNode }) {
  const user = REGISTRATION_ENABLED ? await getCurrentUser() : null
  const initial = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase()
  return (
    <header className="site-header">
      <Pattern />
      <div className="container header-top">
        <Brand />
        <Quote />
        <div className="header-actions">
          {!REGISTRATION_ENABLED ? (
            <Link href="/progress" className="user-pill">
              <span className="avatar" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1F3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                </svg>
              </span>
              Мой прогресс
            </Link>
          ) : user ? (
            <Link href="/cabinet" className="user-pill">
              <span className="avatar">{initial}</span>
              Личный кабинет
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost-light">
                Войти
              </Link>
              <Link href="/register" className="btn-sky">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="container">
        <NavMenu />
      </div>
      {children}
    </header>
  )
}
