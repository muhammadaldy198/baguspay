import bcrypt from 'bcrypt'
import type { InferInsertModel } from 'drizzle-orm'
import type { Database } from '@/database'
import { UserRole } from '@/schema'
import { tb } from '@/table'

export const userSeed = async (db: Database) => {
  const email = process.env.PREVIEW_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.PREVIEW_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('PREVIEW_ADMIN_EMAIL and PREVIEW_ADMIN_PASSWORD are required')
  }

  if (password.length < 12) {
    throw new Error('PREVIEW_ADMIN_PASSWORD must contain at least 12 characters')
  }

  const admin: InferInsertModel<typeof tb.users> = {
    email,
    password: bcrypt.hashSync(password, 10),
    name: process.env.PREVIEW_ADMIN_NAME?.trim() || 'Preview Admin',
    phone: process.env.PREVIEW_ADMIN_PHONE?.trim() || '080000000000',
    role: UserRole.ADMIN,
    is_email_verified: true,
    is_banned: false,
    is_deleted: false,
  }

  await db
    .insert(tb.users)
    .values(admin)
    .onConflictDoUpdate({
      target: tb.users.email,
      set: {
        name: admin.name,
        phone: admin.phone,
        password: admin.password,
        role: UserRole.ADMIN,
        is_email_verified: true,
        is_banned: false,
        is_deleted: false,
        updated_at: new Date(),
      },
    })
}
