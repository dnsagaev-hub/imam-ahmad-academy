/* Обложка книги: картинка, если загружена, иначе — оформленная обложка с арабским названием. */

const TONES: Record<string, string> = {
  matn: 'cover-matn',
  sharh: 'cover-sharh',
  hashiya: 'cover-sharh',
  reference: 'cover-ref',
  translation: 'cover-tr',
  textbook: 'cover-tr',
}

export function BookCover({
  titleAr,
  title,
  authorAr,
  kind,
  coverUrl,
  size = 'md',
}: {
  titleAr?: string | null
  title: string
  authorAr?: string | null
  kind?: string | null
  coverUrl?: string | null
  size?: 'md' | 'lg'
}) {
  if (coverUrl) {
    return (
      <div className={`bcover bcover-${size} bcover-img`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverUrl} alt={`Обложка: ${title}`} loading="lazy" />
      </div>
    )
  }
  const ar = titleAr || title
  return (
    <div className={`bcover bcover-${size} ${TONES[kind ?? 'matn'] ?? 'cover-matn'}`} aria-hidden="true">
      <div className="bcover-frame">
        <span className="bcover-orn">❁</span>
        <span className="bcover-title" lang={titleAr ? 'ar' : undefined} dir={titleAr ? 'rtl' : undefined}>
          {ar}
        </span>
        {authorAr ? (
          <span className="bcover-author" lang="ar" dir="rtl">
            {authorAr}
          </span>
        ) : null}
      </div>
    </div>
  )
}
