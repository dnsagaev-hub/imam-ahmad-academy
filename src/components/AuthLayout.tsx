import { Brand } from './Header'
import { Pattern } from './Icons'

/** Страницы входа и регистрации: слева цитата, справа форма. */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth">
      <section className="auth-side">
        <Pattern id="star8-auth" />
        <div style={{ position: 'relative' }}>
          <Brand />
        </div>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p className="ar" lang="ar" dir="rtl" style={{ margin: 0, fontSize: 52, fontWeight: 700, lineHeight: 1.4, textAlign: 'left' }}>
            مع المحبرة إلى المقبرة
          </p>
          <p className="display" style={{ margin: 0, fontStyle: 'italic', fontWeight: 600, fontSize: 32, color: '#dce8f6' }}>
            «С пером — до могилы»
          </p>
          <p className="quote-by" style={{ margin: 0 }}>
            Имам Ахмад ибн Ханбаль
          </p>
        </div>
        <ul style={{ position: 'relative', listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['I', 'Программа по ступеням', 'От введения в мазхаб к усулю аль-фикх'],
            ['II', 'Тест после каждого урока', 'Знания закрепляются, а не забываются'],
            ['III', 'Личный кабинет', 'Прогресс, баллы, уровни'],
          ].map(([n, t, d]) => (
            <li key={n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span
                className="display"
                style={{ width: 32, height: 32, borderRadius: 99, border: '1px solid var(--gold)', color: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flex: 'none' }}
              >
                {n}
              </span>
              <span>
                <b style={{ display: 'block' }}>{t}</b>
                <span style={{ fontSize: 14, color: '#b9cee6' }}>{d}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="auth-main">
        <div className="auth-box">{children}</div>
      </section>
    </div>
  )
}
