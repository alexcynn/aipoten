import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@aipoten.com'
  const password = 'admin123'
  const name = '관리자'

  console.log('🔧 ADMIN 계정 생성 중...\n')

  // 기존 계정 확인
  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    // 기존 계정을 ADMIN으로 업데이트
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    console.log(`✅ 기존 계정을 ADMIN으로 업데이트했습니다.`)
    console.log(`이메일: ${updated.email}`)
    console.log(`역할: ${updated.role}`)
    console.log(`\n⚠️  비밀번호는 변경되지 않았습니다.`)
  } else {
    // 새 ADMIN 계정 생성
    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN'
      }
    })

    console.log(`✅ ADMIN 계정이 생성되었습니다!`)
    console.log(`\n로그인 정보:`)
    console.log(`이메일: ${admin.email}`)
    console.log(`비밀번호: ${password}`)
    console.log(`역할: ${admin.role}`)
  }
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
