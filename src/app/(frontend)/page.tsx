import Link from 'next/link'

import { REGISTRATION_ENABLED } from '@/lib/config'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { StarIcon } from '@/components/Icons'
import { getSettings } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const settings = await getSettings()

  return (
    <>
      <Header>
        <div className="hero">
          <div className="ornament">
            <span />
            <StarIcon />
            <span />
          </div>
          <h1>{settings.heroTitle || 'Изучайте ханбалитский фикх последовательно — урок за уроком'}</h1>
          <p>{settings.heroText}</p>
          <div className="hero-actions">
            <Link href={REGISTRATION_ENABLED ? '/register' : '/courses'} className="btn btn-lg btn-white">
              Начать обучение
            </Link>
            <Link href="/courses" className="btn btn-lg btn-gold-outline">
              Смотреть курсы
            </Link>
          </div>
        </div>
      </Header>

      <Footer />
    </>
  )
}
