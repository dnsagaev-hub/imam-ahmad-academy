import type { Metadata } from 'next'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageHead } from '@/components/PageHead'

export const metadata: Metadata = { title: 'Политика конфиденциальности' }

/*
 * ВНИМАНИЕ: это заготовка. Перед запуском текст политики нужно подготовить вместе с юристом
 * (152-ФЗ «О персональных данных»): кто оператор, какие данные, цели, сроки, права пользователя.
 */
export default function PrivacyPage() {
  return (
    <>
      <Header />
      <PageHead crumbs={[{ label: 'Главная', href: '/' }, { label: 'Политика конфиденциальности' }]} title="Политика конфиденциальности" />
      <main className="container section prose" style={{ maxWidth: 820 }}>
        <p>[Текст политики обработки персональных данных — подготовить с юристом перед запуском сайта.]</p>
        <p>Какие данные собирает сайт: имя, адрес электронной почты, результаты тестов, сообщения из формы обратной связи.</p>
        <p>Зачем: регистрация и вход в личный кабинет, сохранение прогресса обучения, ответы на вопросы.</p>
      </main>
      <Footer />
    </>
  )
}
