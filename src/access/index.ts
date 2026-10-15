import type { Access, FieldAccess } from 'payload'

type MaybeUser = { id: number | string; role?: string | null } | null | undefined

export const isAdminUser = (user: MaybeUser): boolean => user?.role === 'admin'

export const anyone: Access = () => true

export const adminOnly: Access = ({ req: { user } }) => isAdminUser(user as MaybeUser)

export const adminOnlyField: FieldAccess = ({ req: { user } }) => isAdminUser(user as MaybeUser)

/** Администратор видит всё, ученик — только свои записи (по полю `field`). */
export const adminOrOwn =
  (field: string): Access =>
  ({ req: { user } }) => {
    if (!user) return false
    if (isAdminUser(user as MaybeUser)) return true
    return { [field]: { equals: user.id } }
  }

/** Опубликованное видно всем, скрытое (галочка «Опубликовано» снята) — только администратору. */
export const publishedOrAdmin: Access = ({ req: { user } }) => {
  if (isAdminUser(user as MaybeUser)) return true
  return { isPublished: { equals: true } }
}
