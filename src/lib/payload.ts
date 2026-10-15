import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

export const getPayloadClient = cache(async () => getPayload({ config }))

export type SiteUser = {
  id: number | string
  name?: string | null
  email: string
  role?: string | null
  createdAt?: string
  notifyNewLessons?: boolean | null
}

/** Текущий вошедший пользователь (или null). */
export const getCurrentUser = cache(async (): Promise<SiteUser | null> => {
  const payload = await getPayloadClient()
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  return (user as SiteUser | null) ?? null
})
