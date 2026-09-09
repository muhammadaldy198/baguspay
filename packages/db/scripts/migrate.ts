import 'dotenv/config'

import { fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { createDatabaseFromEnv } from '@/database'

const main = async () => {
  const database = createDatabaseFromEnv()

  try {
    await migrate(drizzle(database.client), {
      migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)),
    })
  } finally {
    await database.close()
  }
}

void main()
