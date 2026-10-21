import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Crumbs } from '@/components/PageHead'
import { SurahView } from '@/components/quran/SurahView'
import { PLACE_LABEL, getSurah, plural } from '@/lib/quran'
import { getReciters, getTranslation } from '@/lib/quranData'

export const dynamic = 'force-dynamic'

const num = (n: string) => (/^[1-9]\d{0,2}$/.test(n) && Number(n) >= 1 && Number(n) <= 114 ? Number(n) : 0)

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const s = getSurah(num((await params).n))
  return { title: s ? `Сура ${s.n} «${s.ru}»` : 'Коран' }
}

async function loadArabic(n: number): Promise<string[]> {
  return (await import(`@/data/quran/${n}.json`)).default as string[]
}

export default async function SurahPage({ params }: { params: Promise<{ n: string }> }) {
  const n = num((await params).n)
  if (!n) notFound()
  const s = getSurah(n)
  const arabic = await loadArabic(n)
  // Басмала стоит перед каждой сурой, кроме ат-Таубы; в аль-Фатихе она — первый аят
  const basmala = n !== 1 && n !== 9 ? (await loadArabic(1))[0].replace(/\s*[٠-٩]+\s*$/, '') : null
  const [tr, reciters] = await Promise.all([getTranslation(n), getReciters()])
  const ayahs = tr?.ayahs?.length ? [...tr.ayahs].sort((a, b) => a.number - b.number) : null
  const translation = ayahs ? Array.from({ length: s.ayahs }, (_, i) => ayahs.find((a) => a.number === i + 1)?.text ?? '') : null
  // Комментарий показывается, только если в нём есть текст
  const comments: Record<number, React.ReactNode> = {}
  for (const a of ayahs ?? []) {
    const c = a.comment as { root?: { children?: unknown[] } } | null | undefined
    if (c?.root?.children?.some((ch) => JSON.stringify(ch).includes('"text":"'))) comments[a.number] = <RichText data={c as never} />
  }
  const prev = n > 1 ? getSurah(n - 1) : null
  const next = n < 114 ? getSurah(n + 1) : null

  return (
    <>
      <Header />
      <div className="subbar">
        <div className="container">
          <Crumbs items={[{ label: 'Главная', href: '/' }, { label: 'Коран', href: '/quran' }, { label: `${n}. ${s.ru}` }]} />
          <div className="sh">
            <div className="sh-ru">
              <p className="eyebrow">Сура {n}</p>
              <h1 className="page-title">{s.ru}</h1>
              <p className="sh-mean">«{s.meaning}»</p>
              <div className="media-stats">
                <span>{PLACE_LABEL[s.place]}</span>
                <span>
                  <b>{s.ayahs}</b> {plural(s.ayahs, ['аят', 'аята', 'аятов'])}
                </span>
              </div>
              {translation && tr?.translator ? <p className="sh-credit">Перевод, комментарий и редакция — {tr.translator}</p> : null}
            </div>
            <p className="sh-ar" lang="ar" dir="rtl">
              سُورَةُ {s.ar}
            </p>
          </div>
        </div>
      </div>
      <main className="container qmain">
        <SurahView surah={s} arabic={arabic} basmala={basmala} basmalaRu={translation ? (tr?.basmala ?? null) : null} translation={translation} comments={comments} reciters={reciters} />
        <nav className="sv-pager" aria-label="Соседние суры">
          {prev ? (
            <Link href={`/quran/${prev.n}`} className="sv-pg">
              <span>← Сура {prev.n}</span>
              <b>{prev.ru}</b>
            </Link>
          ) : (
            <span />
          )}
          <Link href="/quran" className="sv-pg sv-pg-all">
            Все суры
          </Link>
          {next ? (
            <Link href={`/quran/${next.n}`} className="sv-pg sv-pg-next">
              <span>Сура {next.n} →</span>
              <b>{next.ru}</b>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
      <Footer />
    </>
  )
}
