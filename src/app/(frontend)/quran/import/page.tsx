import type { Metadata } from 'next'
import Link from 'next/link'

import { isAdminUser } from '@/access'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { QuranImportForm } from '@/components/quran/QuranImportForm'
import { getCurrentUser } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Загрузить сборник переводов', robots: { index: false } }

/** Загрузка переводов многих сур одним файлом Word. Только для администратора. */
export default async function QuranImportPage() {
  const admin = isAdminUser(await getCurrentUser())
  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Коран', href: '/quran' }, { label: 'Загрузить сборник' }]}
        eyebrow="Для администратора"
        title="Загрузить сборник переводов"
        lead="Один файл Word с несколькими сурами подряд. Перед каждой сурой — абзац «Название» и абзац (смысл названия), затем аяты «1. Перевод…». Сура, перевод которой уже есть, обновится, а толкования и другие пояснения к аятам останутся."
      />
      <main className="container qmain">
        {admin ? (
          <QuranImportForm />
        ) : (
          <p className="qimport-msg bad">
            Эта страница — только для администратора. <Link href="/admin">Войдите в админку</Link> и откройте её снова.
          </p>
        )}
      </main>
      <Footer />
    </>
  )
}
