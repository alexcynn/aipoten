import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@test.com'
  const newPassword = 'test123!'

  console.log('Resetting admin password...')

  const admin = await prisma.user.findUnique({
    where: { email },
  })

  if (!admin) {
    console.error(`❌ Admin user not found: ${email}`)
    return
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  })

  console.log('✅ Admin password reset successfully!')
  console.log(`\nLogin credentials:`)
  console.log(`  Email: ${email}`)
  console.log(`  Password: ${newPassword}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
