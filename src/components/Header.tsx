import Image from 'next/image'
import Link from 'next/link'

import { REGISTRATION_ENABLED } from '@/lib/config'
import { getCurrentUser } from '@/lib/payload'
import { getPrayerDefaults } from '@/lib/queries'

import { Pattern } from './Icons'
import { NavMenu } from './NavMenu'
import { TopBar } from './PrayerWidgets'

/** Значок и название академии. `light` — для тёмного фона. */
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand${light ? ' light' : ''}`} aria-label="Академия имама Ахмада — на главную">
      <Image src="/brand/emblem.png" alt="" width={191} height={391} className="brand-emblem" priority />
      <span>
        <span className="brand-name">
          Академия
          <br />
          имама Ахмада
        </span>
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

/**
 * Шапка сайта: полоса с датой и намазом, белая шапка с меню.
 * `children` — тёмно-зелёный блок под шапкой (главный экран, шапка кабинета).
 */
export async function Header({ children }: { children?: React.ReactNode }) {
  const [user, prayerDefaults] = await Promise.all([REGISTRATION_ENABLED ? getCurrentUser() : null, getPrayerDefaults()])
  const initial = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase()
  return (
    <>
      <TopBar defaults={prayerDefaults} />
      <header className="site-header">
        <div className="container header-top">
          <Brand />
          <Quote />
          <div className="header-actions">
            {!REGISTRATION_ENABLED ? (
              <Link href="/progress" className="user-pill">
                <span className="avatar" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#003D2C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
      </header>
      {children ? (
        <div className="header-band">
          <Pattern />
          {children}
        </div>
      ) : null}
    </>
  )
}
