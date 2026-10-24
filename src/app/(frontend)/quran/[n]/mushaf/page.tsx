import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Crumbs } from '@/components/PageHead'
import { MushafView } from '@/components/quran/MushafView'
import { mushafPages } from '@/lib/mushaf'
import { getSurah, plural } from '@/lib/quran'
import { getReciters } from '@/lib/quranData'

export const dynamic = 'force-dynamic'

const num = (n: string) => (/^[1-9]\d{0,2}$/.test(n) && Number(n) >= 1 && Number(n) <= 114 ? Number(n) : 0)

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const s = getSurah(num((await params).n))
  return { title: s ? `Сура ${s.n} «${s.ru}» — мусхаф Медины` : 'Мусхаф' }
}

/** Сура в мусхафе Медины: её страницы (по одной или разворотами), чтецы и PDF для скачивания. */
export default async function SurahMushafPage({ params }: { params: Promise<{ n: string }> }) {
  const n = num((await params).n)
  if (!n) notFound()
  const s = getSurah(n)
  const p = mushafPages(n)!
  const pages = Array.from({ length: p.to - p.from + 1 }, (_, i) => p.from + i)
  const reciters = await getReciters()

  return (
    <>
      <Header />
      <div className="subbar">
        <div className="container">
          <Crumbs items={[{ label: 'Главная', href: '/' }, { label: 'Коран', href: '/quran' }, { label: `${n}. ${s.ru}`, href: `/quran/${n}` }, { label: 'Мусхаф' }]} />
          <div className="sh">
            <div className="sh-ru">
              <p className="eyebrow">Мусхаф Медины · сура {n}</p>
              <h1 className="page-title">{s.ru}</h1>
              <div className="media-stats">
                <span>
                  {pages.length > 1 ? `Страницы ${p.from}–${p.to}` : `Страница ${p.from}`} · {pages.length} {plural(pages.length, ['страница', 'страницы', 'страниц'])}
                </span>
              </div>
              <div className="sh-info">
                <a className="sh-info-btn sh-pdf" href={`/quran/${n}/mushaf.pdf`} download>
                  Скачать PDF
                </a>
                <Link className="sh-info-btn" href={`/quran/${n}`}>
                  Перевод суры
                </Link>
              </div>
            </div>
            <p className="sh-ar" lang="ar" dir="rtl">
              سُورَةُ {s.ar}
            </p>
          </div>
        </div>
      </div>
      <main className="container qmain">
        <p className="mp-note">Страницы — как в печатном мусхафе Медины (Комплекс короля Фахда, чтение Хафса). На первой и последней странице могут быть видны соседние суры. Можно смотреть по одной странице или разворотом из двух и слушать суру, не уходя со страницы.</p>
        <MushafView surah={s} from={p.from} to={p.to} reciters={reciters} />
      </main>
      <Footer />
    </>
  )
}
