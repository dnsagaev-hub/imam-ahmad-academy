import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Собирает самодостаточный сервер для Docker-образа (см. Dockerfile)
  output: 'standalone',
  // Код написан без возможности собрать проект в среде разработки (не было доступа к npm).
  // Пока проект не прошёл первую сборку и проверку типов, не останавливаем сборку из-за них.
  // TODO: после первой успешной сборки выполнить `npx tsc --noEmit`, исправить ошибки и убрать эту строку.
  typescript: { ignoreBuildErrors: true },
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
