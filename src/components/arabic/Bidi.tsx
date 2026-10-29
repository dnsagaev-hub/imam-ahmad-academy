// Арабские слова внутри русского текста — отдельно, в порядке написания: «هُنَا كِتَابٌ, هُنَاكَ مَسْجِدٌ» не переставляются.
// Пропуск «…» рядом с арабским словом — часть арабского предложения: «الطَّالِبَاتُ … نَاجِحَاتٌ», «فِي الْمَسْجِدِ …»
// читаются справа налево целиком, а не двумя кусками.
const AR = '[؀-ۿ]'
const AR_RUN = new RegExp(`((?:…\\s*)?${AR}(?:[؀-ۿ …]*${AR})?(?:\\s*…)?)`)

// Название падежа по-русски — с арабским в скобках: «в родительном падеже (الْجَرُّ)» (решение владельца 29.10.2026).
// Если арабский термин уже стоит рядом («называется الْجَرُّ — родительный падеж»), второй раз не добавляется.
const CASES: Record<string, { ar: string; bare: string }> = {
  именительн: { ar: 'الرَّفْعُ', bare: 'الرفع' },
  родительн: { ar: 'الْجَرُّ', bare: 'الجر' },
  винительн: { ar: 'النَّصْبُ', bare: 'النصب' },
}
const CASE_RE = /(?<![а-яё])(именительн|родительн|винительн)(?:ый|ого|ому|ом|ым|ая|ой|ую|ые|ых|ыми)(?:\s+падеж(?:а|у|ом|е|и|ей|ам|ах|ами)?(?![а-яё]))?(?![а-яё])/gi
const plain = (s: string) => s.replace(/[ً-ْٰـ]/g, '')

export function withCaseNames(text: string): string {
  if (!/(именительн|родительн|винительн)/i.test(text)) return text
  return text.replace(CASE_RE, (m, stem: string, at: number, all: string) => {
    const c = CASES[stem.toLowerCase()]
    const near = plain(all.slice(Math.max(0, at - 40), at + m.length + 40))
    if (near.includes(c.bare)) return m
    return `${m} (${c.ar})`
  })
}

export function Bidi({ text }: { text: string }) {
  return withCaseNames(text)
    .split(AR_RUN)
    .map((t, i) =>
      i % 2 ? (
        <bdi key={i} className="ar ar-inline" lang="ar">
          {t}
        </bdi>
      ) : (
        t
      ),
    )
}
