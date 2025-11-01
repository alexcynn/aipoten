import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userId = 'cmhbztz5j0003l1bwzyopvx7y'

  console.log('=== 사용자 확인 ===')
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    }
  })
  console.log('사용자:', user)

  console.log('\n=== 치료사 프로필 확인 ===')
  const profile = await prisma.therapistProfile.findUnique({
    where: { userId },
  })
  console.log('프로필:', profile)

  if (!profile) {
    console.log('\n❌ 프로필이 없습니다!')
    console.log('\n모든 치료사 프로필 조회:')
    const allProfiles = await prisma.therapistProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })
    console.log(`총 ${allProfiles.length}개의 프로필:`)
    allProfiles.forEach(p => {
      console.log(`- ${p.user.name} (${p.user.email}): userId=${p.userId}`)
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
