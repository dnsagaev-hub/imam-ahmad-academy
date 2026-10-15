'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ARTICLE_CATEGORIES, COURSE_LEVELS, LESSON_CATEGORIES } from '@/lib/constants'

import { ChevronIcon } from './Icons'

type Item = { label: string; href: string; match: string; sub?: { label: string; href: string }[] }

const items: Item[] = [
  { label: 'О сайте', href: '/about', match: '/about' },
  {
    label: 'Курсы',
    href: '/courses',
    match: '/courses',
    sub: COURSE_LEVELS.map((l) => ({ label: l.label, href: `/courses?level=${l.value}` })),
  },
  {
    label: 'Аудиоуроки',
    href: '/audio',
    match: '/audio',
    sub: LESSON_CATEGORIES.map((c) => ({ label: c.label, href: `/audio?category=${c.value}` })),
  },
  {
    label: 'Видеоуроки',
    href: '/video',
    match: '/video',
    sub: LESSON_CATEGORIES.map((c) => ({ label: c.label, href: `/video?category=${c.value}` })),
  },
  {
    label: 'Статьи и вопросы',
    href: '/articles',
    match: '/articles',
    sub: ARTICLE_CATEGORIES.map((c) => ({ label: c.label, href: `/articles?category=${c.value}` })),
  },
  { label: 'Библиотека', href: '/library', match: '/library' },
  { label: 'Связаться с нами', href: '/contact', match: '/contact' },
]

export function NavMenu() {
  const pathname = usePathname() || '/'
  return (
    <nav className="main-nav" aria-label="Основное меню">
      <ul>
        {items.map((item) => {
          const active = pathname.startsWith(item.match) || (item.match === '/courses' && pathname.startsWith('/lessons'))
          return (
            <li className="nav-item" key={item.href}>
              <Link className={`nav-link${active ? ' active' : ''}`} href={item.href}>
                {item.label}
                {item.sub ? <ChevronIcon /> : null}
              </Link>
              {item.sub ? (
                <div className="dropdown">
                  {item.sub.map((s) => (
                    <Link key={s.href} href={s.href}>
                      {s.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
