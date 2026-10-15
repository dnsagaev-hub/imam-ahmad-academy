import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container section" style={{ textAlign: 'center', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <h1 className="page-title">Страница не найдена</h1>
        <p className="lead">Возможно, материал перенесён или ещё не опубликован.</p>
        <Link href="/" className="btn">
          На главную
        </Link>
      </main>
      <Footer />
    </>
  )
}
