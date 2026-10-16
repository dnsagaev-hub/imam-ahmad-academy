import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactForm } from '@/components/ContactForm'
import { QuestionBuilder } from '@/components/contact/QuestionBuilder'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'
import { REGISTRATION_ENABLED } from '@/lib/config'
import { getSettings } from '@/lib/queries'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Связаться с нами' }

const DEFAULT_FAQ = [
  {
    q: 'Вы выдаёте фетвы?',
    a: 'Нет. Мы объясняем, что говорится в книгах ханбалитского мазхаба, с текстом источника и переводом. Если ваш случай особый (развод, наследство, споры, клятвы), обратитесь к учёному, который выслушает все обстоятельства.',
  },
  {
    q: 'На какие книги вы опираетесь?',
    a: 'Основное мнение мазхаба — по «Шарх Мунтаха аль-Ирадат» и «Кашшаф аль-Кына‘» аль-Бухути и «Матолиб улин-нуха». Другие мнения, например выборы Ибн Таймии, приводятся с пометкой.',
  },
  {
    q: 'Нужно ли регистрироваться, чтобы учиться?',
    a: 'Нет. Уроки и тесты открыты, а прогресс сохраняется в вашем браузере. Его можно сохранить в файл и перенести на другое устройство на странице «Мой прогресс».',
  },
  {
    q: 'Мой вопрос опубликуют?',
    a: 'Только если вы разрешите, и всегда без имени. Полезные разборы появляются в разделе «Статьи и вопросы».',
  },
  {
    q: 'Можно ли предложить тему урока или сообщить об ошибке?',
    a: 'Да, будем благодарны. Укажите урок и место, где заметили неточность, — мы сверим с книгой и исправим.',
  },
]

const STEPS = [
  { t: 'Поищите ответ', d: 'Возможно, вопрос уже разобран в разделе «Статьи и вопросы» или в уроках.' },
  { t: 'Один вопрос — одно сообщение', d: 'Так ответ будет точнее, а разбор можно будет опубликовать отдельно.' },
  { t: 'Опишите обстоятельства', d: 'В фикхе ответ часто зависит от деталей: что произошло, когда, где.' },
  { t: 'Отправьте удобным способом', d: 'Скопируйте готовый текст и отправьте в Telegram или на почту.' },
]

export default async function ContactPage() {
  const s: any = await getSettings()
  const faq: { q: string; a: string }[] = Array.isArray(s.faq) && s.faq.length ? s.faq : DEFAULT_FAQ

  const channels = [
    s.telegram && {
      href: s.telegram,
      title: 'Telegram',
      note: 'Вопросы и сообщения — быстрее всего',
      icon: 'M21 4 3 11l6 2 2 6 3-4 5 4z M9 13l9-7',
    },
    s.contactEmail && {
      href: `mailto:${s.contactEmail}`,
      title: s.contactEmail,
      note: 'Для подробных вопросов и предложений',
      icon: 'M3 6h18v12H3z M3 7l9 6 9-6',
    },
    s.telegramChannel && {
      href: s.telegramChannel,
      title: 'Канал академии',
      note: 'Новые уроки и разборы',
      icon: 'M4 10v4h3l6 4V6L7 10z M17 9a4 4 0 0 1 0 6',
    },
    s.vk && { href: s.vk, title: 'ВКонтакте', note: 'Сообщество академии', icon: 'M4 7h3c1 4 3 6 4 6V7h3v3c1 0 3-2 3-3h3c-1 3-3 4-4 5 1 1 3 2 4 5h-3c-1-2-2-3-3-3v3h-2c-4 0-8-4-8-12z' },
    s.youtube && { href: s.youtube, title: 'YouTube', note: 'Видеоуроки', icon: 'M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z M10 9l5 3-5 3z' },
  ].filter(Boolean) as { href: string; title: string; note: string; icon: string }[]

  return (
    <>
      <Header />
      <PageHead
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Связаться с нами' }]}
        eyebrow="Связаться с нами"
        title="Задать вопрос"
        lead="Вопросы по урокам, фикху или работе сайта. Полезные разборы публикуются — без имени — в разделе «Статьи и вопросы»."
      />

      <main className="container section contact">
        <div className="contact-grid">
          <section className="card card-pad contact-main">
            <h2 className="display" style={{ margin: 0, fontSize: 28, color: "var(--navy)" }}>
              {REGISTRATION_ENABLED ? 'Написать нам' : 'Составьте вопрос'}
            </h2>
            {REGISTRATION_ENABLED ? (
              <ContactForm />
            ) : (
              <>
                <p className="muted" style={{ margin: 0 }}>
                  Заполните поля — получится готовое сообщение. Скопируйте его и отправьте нам в Telegram или на почту.
                </p>
                <QuestionBuilder telegram={s.telegram} email={s.contactEmail} />
              </>
            )}
          </section>

          <aside className="contact-side">
            <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="tl-label">Как с нами связаться</span>
              {channels.length ? (
                <ul className="channels">
                  {channels.map((c) => (
                    <li key={c.href}>
                      <a href={c.href} target={c.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener" className="channel">
                        <span className="channel-ic" aria-hidden="true">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
                            <path d={c.icon} />
                          </svg>
                        </span>
                        <span>
                          <b>{c.title}</b>
                          <small>{c.note}</small>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted" style={{ margin: 0 }}>
                  Контакты появятся здесь, когда вы заполните их в админке («Настройки сайта» → «Связаться с нами»).
                </p>
              )}
              {s.responseTime ? (
                <p className="contact-time">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  {s.responseTime}
                </p>
              ) : null}
            </div>

            <div className="card card-pad qa-disclaimer" style={{ margin: 0 }}>
              <b>Мы не выносим личных фетв.</b> Разборы объясняют, что сказано в книгах мазхаба. В вопросах развода,
              наследства, клятв и споров обратитесь к учёному лично.
            </div>

            <Link href="/articles?kind=question" className="card card-pad contact-link">
              <span className="tl-label">Возможно, ответ уже есть</span>
              <b>Разборы вопросов →</b>
            </Link>
          </aside>
        </div>

        <section className="contact-steps">
          <h2 className="h2" style={{ margin: 0, fontSize: 32 }}>
            Как задать вопрос, чтобы получить ответ
          </h2>
          <ol className="steps">
            {STEPS.map((st, i) => (
              <li key={st.t} className="card">
                <span className="num">{i + 1}</span>
                <b>{st.t}</b>
                <span>{st.d}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="faq">
          <h2 className="h2" style={{ margin: 0, fontSize: 32 }}>
            Частые вопросы
          </h2>
          <div className="faq-list">
            {faq.map((f, i) => (
              <details key={i} className="faq-item" open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
