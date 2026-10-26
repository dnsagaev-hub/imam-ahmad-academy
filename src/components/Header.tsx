import Image from 'next/image'
import Link from 'next/link'

import { REGISTRATION_ENABLED } from '@/lib/config'
import { getCurrentUser } from '@/lib/payload'
import { toLeanCourse } from '@/lib/learning'
import { getCourses, getPrayerDefaults } from '@/lib/queries'

import { Pattern, SearchIcon } from './Icons'
import { NavMenu } from './NavMenu'
import { TopBar } from './PrayerWidgets'
import { ProgressButton } from './progress/ProgressButton'

/** Значок и название академии. `light` — для тёмного фона. */
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand${light ? ' light' : ''}`} aria-label="Академия имама Ахмада — на главную">
      <Image src="/brand/emblem.png" alt="" width={191} height={391} className="brand-emblem" priority unoptimized />
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
      <figcaption>
        <span className="quote-ru">«С чернильницей — до могилы»</span>
        <span className="quote-by">Ахмад ибн Ханбаль</span>
      </figcaption>
    </figure>
  )
}

/**
 * Шапка сайта: полоса с датой и намазом, белая шапка с меню.
 * `children` — тёмно-зелёный блок под шапкой (главный экран, шапка кабинета).
 * `plain` — зелёный блок без узора из звёзд (на главной вместо него эмблема).
 */
export async function Header({ children, plain = false }: { children?: React.ReactNode; plain?: boolean }) {
  const [user, prayerDefaults, courses] = await Promise.all([
    REGISTRATION_ENABLED ? getCurrentUser() : null,
    getPrayerDefaults(),
    REGISTRATION_ENABLED ? Promise.resolve([]) : getCourses(),
  ])
  // Для кнопки «Мой прогресс»: только порядок и названия уроков, без ответов тестов
  const leanCourses = courses.map(toLeanCourse)
  const initial = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase()
  return (
    <>
      <TopBar defaults={prayerDefaults} />
      <header className="site-header">
        <div className="container header-top">
          <Brand />
          <Quote />
          <div className="header-actions">
            <Link href="/search" className="hs-btn" aria-label="Поиск по сайту">
              <SearchIcon size={20} />
              <span className="hs-text">Поиск</span>
            </Link>
            {!REGISTRATION_ENABLED ? (
              <ProgressButton courses={leanCourses} />
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
        <div className={`header-band${plain ? ' plain' : ''}`}>
          {plain ? null : <Pattern />}
          {children}
        </div>
      ) : null}
    </>
  )
}
