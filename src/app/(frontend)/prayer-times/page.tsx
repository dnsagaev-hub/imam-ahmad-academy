import type { Metadata } from 'next'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { PrayerTimesPanel } from '@/components/PrayerWidgets'
import { getPrayerDefaults } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Время намазов' }

export default async function PrayerTimesPage() {
  const defaults = await getPrayerDefaults()
  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Время намазов' }]}
        eyebrow="Время намазов"
        title="Расписание на сегодня"
      />
      <main className="container section" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 980 }}>
        <PrayerTimesPanel defaults={defaults} />
        <div className="muted" style={{ fontSize: 14, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ margin: 0 }}>
            Время рассчитывается астрономически по координатам — прямо в вашем браузере. Местоположение никуда не
            передаётся и хранится только на этом устройстве.
          </p>
          <p style={{ margin: 0 }}>
            Аср — когда тень предмета равна его длине (мнение ханбалитского мазхаба). Расчёт приблизительный: сверяйтесь с
            расписанием мечети вашего города, особенно летом в северных широтах.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
