import type { Metadata } from 'next'
import React from 'react'

// Шрифты лежат вместе с сайтом (без обращения к Google Fonts при сборке и у посетителей)
import '@fontsource-variable/cormorant-garamond'
import '@fontsource-variable/cormorant-garamond/wght-italic.css'
import '@fontsource-variable/manrope'
import '@fontsource/amiri/400.css'
import '@fontsource/amiri/700.css'

import { AudioPlayerProvider } from '@/components/audio/AudioPlayer'

import './styles.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: {
    default: 'Академия имама Ахмада — онлайн-школа ханбалитского фикха',
    template: '%s — Академия имама Ахмада',
  },
  description:
    'Последовательное изучение ханбалитского мазхаба: видео- и аудиоуроки по матнам, тесты после каждого урока, библиотека и статьи.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AudioPlayerProvider>{children}</AudioPlayerProvider>
      </body>
    </html>
  )
}
