import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="name">Академия имама Ахмада</span>
          <span className="ar" lang="ar" style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold-light)', textAlign: 'left' }}>
            مع المحبرة إلى المقبرة
          </span>
        </div>
        <nav className="footer-links" aria-label="Нижнее меню">
          <Link href="/about">О сайте</Link>
          <Link href="/courses">Курсы</Link>
          <Link href="/library">Библиотека</Link>
          <Link href="/articles">Статьи и вопросы</Link>
          <Link href="/contact">Связаться с нами</Link>
        </nav>
      </div>
      <div className="container footer-legal">
        <span>© {year} Академия имама Ахмада</span>
        <Link href="/privacy">Конфиденциальность</Link>
      </div>
    </footer>
  )
}
