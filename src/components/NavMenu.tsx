'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ARTICLE_CATEGORIES, COURSE_LEVELS, MEDIA_CATEGORIES, TEXT_CATEGORIES } from '@/lib/constants'

import { ChevronIcon } from './Icons'

type Item = { label: string; href: string; match: string; sub?: { label: string; href: string }[] }
/** Пункт-группа: своей страницы нет, по наведению (на телефоне — по нажатию) раскрывает пункты со своими рубриками. */
type Group = { label: string; key: string; group: Item[] }

const lessonItems: Item[] = [
  {
    label: 'Текстовые уроки',
    href: '/text',
    match: '/text',
    sub: TEXT_CATEGORIES.map((c) => ({ label: c.label, href: `/text?category=${c.value}` })),
  },
  {
    label: 'Аудиоуроки',
    href: '/audio',
    match: '/audio',
    sub: MEDIA_CATEGORIES.map((c) => ({ label: c.label, href: `/audio?category=${c.value}` })),
  },
  {
    label: 'Видеоуроки',
    href: '/video',
    match: '/video',
    sub: MEDIA_CATEGORIES.map((c) => ({ label: c.label, href: `/video?category=${c.value}` })),
  },
]

const items: (Item | Group)[] = [
  { label: 'О сайте', href: '/about', match: '/about' },
  { label: 'Коран', href: '/quran', match: '/quran' },
  { label: 'Хадисы', href: '/hadith', match: '/hadith' },
  {
    label: 'Курсы',
    href: '/courses',
    match: '/courses',
    sub: COURSE_LEVELS.map((l) => ({ label: l.label, href: `/courses?level=${l.value}` })),
  },
  { label: 'Уроки', key: 'lessons', group: lessonItems },
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
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedSub, setExpandedSub] = useState<string | null>(null)

  // На телефоне меню закрывается после перехода на другую страницу
  useEffect(() => {
    setOpen(false)
    setExpanded(null)
    setExpandedSub(null)
  }, [pathname])

  const isActive = (item: Item) =>
    pathname.startsWith(item.match) || (item.match === '/courses' && pathname.startsWith('/lessons'))

  return (
    <nav className={`main-nav${open ? ' open' : ''}`} aria-label="Основное меню">
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="main-menu"
        onClick={() => setOpen(!open)}
      >
        <span className="nav-toggle-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="sr-only">{open ? 'Закрыть меню' : 'Открыть меню'}</span>
      </button>
      <ul id="main-menu">
        {items.map((item) => {
          if ('group' in item) {
            const active = item.group.some(isActive)
            const isOpen = expanded === item.key
            return (
              <li className={`nav-item nav-group${isOpen ? ' expanded' : ''}`} key={item.key}>
                <div className="nav-row">
                  <button
                    type="button"
                    className={`nav-link${active ? ' active' : ''}`}
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : item.key)}
                  >
                    {item.label}
                    <ChevronIcon />
                  </button>
                </div>
                <div className="dropdown">
                  {item.group.map((g) => {
                    const subOpen = expandedSub === g.href
                    return (
                      <div className={`sub-item${subOpen ? ' expanded' : ''}`} key={g.href}>
                        <div className="sub-row">
                          <Link className={`sub-link${isActive(g) ? ' active' : ''}`} href={g.href}>
                            {g.label}
                            <ChevronIcon />
                          </Link>
                          <button
                            type="button"
                            className="nav-expand"
                            aria-expanded={subOpen}
                            aria-label={`Рубрики: ${g.label}`}
                            onClick={() => setExpandedSub(subOpen ? null : g.href)}
                          >
                            <ChevronIcon />
                          </button>
                        </div>
                        <div className="subdropdown">
                          {g.sub?.map((s) => (
                            <Link key={s.href} href={s.href}>
                              {s.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </li>
            )
          }
          const active = isActive(item)
          const isOpen = expanded === item.href
          return (
            <li className={`nav-item${isOpen ? ' expanded' : ''}`} key={item.href}>
              <div className="nav-row">
                <Link className={`nav-link${active ? ' active' : ''}`} href={item.href}>
                  {item.label}
                  {item.sub ? <ChevronIcon /> : null}
                </Link>
                {item.sub ? (
                  <button
                    type="button"
                    className="nav-expand"
                    aria-expanded={isOpen}
                    aria-label={`Рубрики: ${item.label}`}
                    onClick={() => setExpanded(isOpen ? null : item.href)}
                  >
                    <ChevronIcon />
                  </button>
                ) : null}
              </div>
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
