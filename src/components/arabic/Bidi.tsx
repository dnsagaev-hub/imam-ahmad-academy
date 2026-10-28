// Арабские слова внутри русского текста — отдельно, в порядке написания: «هُنَا كِتَابٌ, هُنَاكَ مَسْجِدٌ» не переставляются
const AR_RUN = /([؀-ۿ](?:[؀-ۿ ]*[؀-ۿ])?)/
export function Bidi({ text }: { text: string }) {
  return text.split(AR_RUN).map((t, i) =>
    i % 2 ? (
      <bdi key={i} className="ar ar-inline" lang="ar">
        {t}
      </bdi>
    ) : (
      t
    ),
  )
}
