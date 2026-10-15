import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { getSettings } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'О сайте' }

export default async function AboutPage() {
  const s = await getSettings()
  return (
    <>
      <Header />
      <PageHead crumbs={[{ label: 'Главная', href: '/' }, { label: 'О сайте' }]} eyebrow="О сайте" title={s.aboutTitle || 'О сайте'} />
      <main className="container section">
        <div className="about">
          <div>
            {s.aboutText ? (
              s.aboutText.split(/\n{2,}/).map((p: string, i: number) => (
                <p key={i} className="lead" style={{ marginBottom: 16 }}>
                  {p}
                </p>
              ))
            ) : (
              <p className="lead">Текст об академии можно заполнить в админке: «Настройки сайта» → «Текст „О сайте“».</p>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <Link href="/courses" className="btn">
                Смотреть курсы
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Задать вопрос
              </Link>
            </div>
          </div>
          <div className="features">
            {[
              ['I', 'Программа по ступеням', 'Начальный, средний и продвинутый уровни по матнам мазхаба.'],
              ['II', 'Тест после урока', 'Следующий урок открывается после сдачи теста.'],
              ['III', 'Личный кабинет', 'Прогресс, средний балл и шкала успеха.'],
            ].map(([n, t, d]) => (
              <div className="card feature" key={n}>
                <span className="num">{n}</span>
                <b>{t}</b>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
