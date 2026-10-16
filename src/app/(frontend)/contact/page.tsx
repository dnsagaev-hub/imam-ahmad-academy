import type { Metadata } from 'next'

import { ContactForm } from '@/components/ContactForm'
import { ContactLinks } from '@/components/ContactLinks'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { REGISTRATION_ENABLED } from '@/lib/config'
import { getSettings } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Связаться с нами' }

export default async function ContactPage() {
  const s = await getSettings()
  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Связаться с нами' }]}
        eyebrow="Связаться с нами"
        title="Задать вопрос"
        lead="Вопросы по урокам, фикху или работе сайта. Полезные разборы публикуются в разделе «Статьи и вопросы»."
      />
      <main className="container section">
        <div className="card card-pad" style={{ maxWidth: 620 }}>
          {REGISTRATION_ENABLED ? <ContactForm /> : <ContactLinks email={s.contactEmail} telegram={s.telegram} />}
        </div>
      </main>
      <Footer />
    </>
  )
}
