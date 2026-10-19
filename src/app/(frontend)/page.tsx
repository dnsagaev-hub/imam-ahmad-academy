import Image from 'next/image'
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
      <Header plain>
        {/* Телефон: большая полупрозрачная эмблема за текстом */}
        <Image src="/brand/emblem-white.png" alt="" width={191} height={391} className="hero-watermark" unoptimized />
        <div className="hero">
          {/* Компьютер: арочная дверь распахивается при загрузке, в проёме — эмблема («дверь к знаниям») */}
          <div className="hero-door" aria-hidden="true">
            <span className="door-frame" />
            <span className="door-light">
              <Image src="/brand/emblem.png" alt="" width={191} height={391} unoptimized priority />
            </span>
            <span className="door-leaf left" />
            <span className="door-leaf right" />
            <span className="door-beam" />
          </div>
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
