import type { Metadata } from 'next'

import { ContactForm } from '@/components/ContactForm'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
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
        lead="Вопросы по урокам, фикху или работе сайта. Ответ придёт на почту, а полезные разборы публикуются в разделе «Статьи и вопросы»."
      />
      <main className="container section">
        <div className="about">
          <div>
            {s.contactEmail ? (
              <p className="lead">
                Почта: <a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a>
              </p>
            ) : null}
            {s.telegram ? (
              <p className="lead">
                Telegram:{' '}
                <a href={s.telegram} target="_blank" rel="noopener">
                  {s.telegram.replace(/^https?:\/\//, '')}
                </a>
              </p>
            ) : null}
          </div>
          <div className="card card-pad" style={{ flex: '1 1 460px', minWidth: 0 }}>
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
