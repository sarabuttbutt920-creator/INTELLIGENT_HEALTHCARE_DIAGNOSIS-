import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting seed process...')

    const adminEmail = 'admin@doc.com'
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    })

    if (!existingAdmin) {
        console.log('No SuperAdmin found. Creating default admin...')
        const hashedPassword = await bcrypt.hash('Sara920', 10)

        await prisma.user.create({
            data: {
                email: adminEmail,
                full_name: 'Super Admin',
                password_hash: hashedPassword,
                role: 'ADMIN',
                is_active: true
            }
        })
        console.log('SuperAdmin successfully created: admin@doc.com')
    } else {
        console.log('SuperAdmin already exists in the database. Skipping creation.')
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('Error seeding the database:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
