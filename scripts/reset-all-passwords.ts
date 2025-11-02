import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Resetting all user passwords...\n')

  // 관리자
  const adminPassword = await bcrypt.hash('test123!', 10)
  await prisma.user.updateMany({
    where: { email: 'admin@test.com' },
    data: { password: adminPassword },
  })
  console.log('✅ Admin password reset: admin@test.com / test123!')

  // 부모
  const parentPassword = await bcrypt.hash('test123!', 10)
  await prisma.user.updateMany({
    where: { email: 'parent@test.com' },
    data: { password: parentPassword },
  })
  console.log('✅ Parent password reset: parent@test.com / test123!')

  // 치료사들
  const therapistPassword = await bcrypt.hash('password123', 10)
  const therapistEmails = [
    'jieun.kim@therapist.com',
    'minho.park@therapist.com',
    'soyoung.lee@therapist.com',
    'jihoon.choi@therapist.com',
    'yuna.jung@therapist.com',
  ]

  for (const email of therapistEmails) {
    await prisma.user.updateMany({
      where: { email },
      data: { password: therapistPassword },
    })
    console.log(`✅ Therapist password reset: ${email} / password123`)
  }

  console.log('\n✅ All passwords have been reset!')
  console.log('\n📋 Login credentials:')
  console.log('   👨‍💼 관리자: admin@test.com / test123!')
  console.log('   👨‍👩‍👧 부모: parent@test.com / test123!')
  console.log('   👩‍⚕️ 치료사들: password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
