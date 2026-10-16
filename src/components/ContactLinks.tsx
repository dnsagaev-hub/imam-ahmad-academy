/** Вместо формы (когда сайт не собирает данные): ссылки на Telegram и почту. */
export function ContactLinks({ email, telegram }: { email?: string | null; telegram?: string | null }) {
  if (!email && !telegram) {
    return <p className="muted">Контакты появятся здесь: заполните их в админке («Настройки сайта»).</p>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p className="muted" style={{ margin: 0 }}>
        Напишите нам напрямую — так быстрее всего:
      </p>
      {telegram ? (
        <a href={telegram} target="_blank" rel="noopener" className="btn btn-lg">
          Написать в Telegram
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className="btn btn-lg btn-outline">
          Написать на почту: {email}
        </a>
      ) : null}
    </div>
  )
}
