import type { Metadata } from 'next'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { QuranIndex } from '@/components/quran/QuranIndex'
import { getTranslatedSurahs } from '@/lib/quranData'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Коран' }

export default async function QuranPage() {
  const translated = await getTranslatedSurahs()
  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Коран' }]}
        eyebrow="Благородный Коран"
        title="Коран"
        lead="Арабский текст мусхафа Медины и авторский перевод смыслов с пояснениями. У каждой суры — чтение и прослушивание в исполнении известных чтецов."
      >
        <p className="qh-ar" lang="ar" dir="rtl">
          القُرۡءَانُ الكَرِيمُ
        </p>
      </PageHead>
      <main className="container qmain">
        <QuranIndex translated={translated} />
      </main>
      <Footer />
    </>
  )
}
