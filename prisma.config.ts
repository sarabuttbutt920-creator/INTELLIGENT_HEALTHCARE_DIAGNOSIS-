import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

// Load .env file so DATABASE_URL is available
config()

export default defineConfig({
    schema: path.join(__dirname, 'prisma', 'schema.prisma'),
    migrations: {
        seed: 'npx tsx prisma/seed.ts',
    },
})
