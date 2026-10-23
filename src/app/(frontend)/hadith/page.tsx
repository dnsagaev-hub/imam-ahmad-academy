import type { Metadata } from 'next'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { HadithCards } from '@/components/hadith/HadithCards'
import { books, getHadithTopics, hadiths } from '@/lib/hadithData'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Хадисы' }

export default async function HadithPage() {
  const topics = await getHadithTopics()
  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Хадисы' }]}
        eyebrow="Пречистая Сунна"
        title="Хадисы"
        lead="Хадисы Пророка (да благословит его Аллах и приветствует) по темам и книгам: арабский текст с огласовками и перевод. У каждого хадиса — источник, степень достоверности и разъяснение."
      >
        <p className="qh-ar hd-head-ar" lang="ar" dir="rtl">
          الأَحَادِيثُ النَّبَوِيَّةُ
        </p>
      </PageHead>
      <main className="container qmain">
        {topics.length ? (
          <HadithCards
            items={topics.map((t, i) => ({
              href: `/hadith/${t.slug}`,
              n: i + 1,
              title: t.title,
              titleAr: t.titleAr,
              meta: [t.books ? books(t.books) : '', t.hadiths ? hadiths(t.hadiths) : ''].filter(Boolean).join(' · '),
              empty: !t.hadiths,
            }))}
          />
        ) : (
          <p className="empty">Раздел готовится: темы появятся, как только будут добавлены.</p>
        )}
      </main>
      <Footer />
    </>
  )
}
