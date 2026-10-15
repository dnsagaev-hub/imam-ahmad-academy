import Link from 'next/link'

import { ArticleCard, AudioRow, BookCard, CourseCard, VideoCard } from '@/components/Cards'
import { ContactForm } from '@/components/ContactForm'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { StarIcon } from '@/components/Icons'
import { LESSON_CATEGORIES } from '@/lib/constants'
import { getArticles, getBooks, getCourses, getLessons, getSettings } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [settings, courses, audios, videos, articles, books] = await Promise.all([
    getSettings(),
    getCourses(),
    getLessons({ kind: 'audio', limit: 4 }),
    getLessons({ kind: 'video', limit: 3 }),
    getArticles({ limit: 3 }),
    getBooks({ limit: 5 }),
  ])

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
            <Link href="/register" className="btn btn-lg btn-white">
              Начать обучение
            </Link>
            <Link href="/courses" className="btn btn-lg btn-gold-outline">
              Смотреть курсы
            </Link>
          </div>
        </div>
      </Header>

      <main>
        <section className="container section section-first" id="about">
          <div className="about">
            <div>
              <p className="eyebrow">О сайте</p>
              <h2 className="h2">{settings.aboutTitle || 'Знание — по ступеням'}</h2>
              {settings.aboutText ? <p className="lead">{settings.aboutText}</p> : null}
            </div>
            <div className="features">
              {[
                ['I', 'Программа по ступеням', 'Начальный, средний и продвинутый уровни по матнам мазхаба.'],
                ['II', 'Тест после урока', 'Следующий урок открывается после сдачи теста.'],
                ['III', 'Личный кабинет', 'Прогресс, средний балл и шкала успеха.'],
              ].map(([n, t, d]) => (
                <div className="card feature" key={n}>
                  <span className="num">{n}</span>
                  <b>{t}</b>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container section" id="courses">
          <div className="section-head">
            <div>
              <p className="eyebrow">Курсы</p>
              <h2 className="h2">Три ступени обучения</h2>
            </div>
            <Link href="/courses" style={{ fontWeight: 700 }}>
              Все курсы →
            </Link>
          </div>
          {courses.length ? (
            <div className="grid grid-280">
              {courses.slice(0, 6).map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <p className="empty">Курсы скоро появятся.</p>
          )}
        </section>

        <section className="container section" id="audio">
          <p className="eyebrow">Аудиоуроки</p>
          <h2 className="h2">Слушайте в дороге</h2>
          <div className="chips">
            {LESSON_CATEGORIES.map((c) => (
              <Link key={c.value} className="chip" href={`/audio?category=${c.value}`}>
                {c.label}
              </Link>
            ))}
          </div>
          {audios.length ? (
            <div className="card audio-list">
              {audios.map((l) => (
                <AudioRow key={l.id} lesson={l} />
              ))}
            </div>
          ) : (
            <p className="empty">Аудиоуроки скоро появятся.</p>
          )}
        </section>

        <section className="container section" id="video">
          <p className="eyebrow">Видеоуроки</p>
          <h2 className="h2">Занятия с разбором текста</h2>
          <div className="chips">
            {LESSON_CATEGORIES.map((c) => (
              <Link key={c.value} className="chip" href={`/video?category=${c.value}`}>
                {c.label}
              </Link>
            ))}
          </div>
          {videos.length ? (
            <div className="grid grid-320">
              {videos.map((l) => (
                <VideoCard key={l.id} lesson={l} />
              ))}
            </div>
          ) : (
            <p className="empty">Видеоуроки скоро появятся.</p>
          )}
        </section>

        <section className="container section" id="articles">
          <div className="section-head">
            <div>
              <p className="eyebrow">Статьи и вопросы</p>
              <h2 className="h2">Статьи и разборы</h2>
            </div>
            <Link href="/articles" style={{ fontWeight: 700 }}>
              Все статьи →
            </Link>
          </div>
          {articles.length ? (
            <div className="grid grid-320">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          ) : (
            <p className="empty">Статьи скоро появятся.</p>
          )}
        </section>

        <section className="container section" id="library">
          <div className="section-head">
            <div>
              <p className="eyebrow">Библиотека</p>
              <h2 className="h2">Матны, шархи и пособия</h2>
            </div>
            <Link href="/library" style={{ fontWeight: 700 }}>
              Вся библиотека →
            </Link>
          </div>
          {books.length ? (
            <div className="grid grid-200">
              {books.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          ) : (
            <p className="empty">Книги скоро появятся.</p>
          )}
        </section>

        <section className="container section" id="contact">
          <div className="about">
            <div>
              <p className="eyebrow">Связаться с нами</p>
              <h2 className="h2">Задать вопрос</h2>
              <p className="lead">
                Вопросы по урокам, фикху или работе сайта. Ответ придёт на почту, а полезные разборы публикуются в
                разделе «Статьи и вопросы».
              </p>
            </div>
            <div className="card card-pad" style={{ flex: '1 1 460px', minWidth: 0 }}>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
