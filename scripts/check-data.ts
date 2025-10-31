/**
 * 데이터베이스 데이터 확인
 * 실행: npx tsx scripts/check-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  console.log('📊 데이터베이스 데이터 확인 중...\n')

  try {
    // 사용자 통계
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    })

    console.log('👥 사용자 통계:')
    for (const stat of userStats) {
      console.log(`   ${stat.role}: ${stat._count}명`)
    }

    // 치료사 통계
    const therapistCount = await prisma.therapistProfile.count()
    const approvedTherapistCount = await prisma.therapistProfile.count({
      where: { approvalStatus: 'APPROVED' }
    })

    console.log(`\n👨‍⚕️ 치료사 프로필:`)
    console.log(`   전체: ${therapistCount}명`)
    console.log(`   승인됨: ${approvedTherapistCount}명`)

    // 치료사 목록
    if (therapistCount > 0) {
      console.log('\n📋 치료사 목록:')
      const therapists = await prisma.therapistProfile.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        },
        take: 10,
      })

      for (const therapist of therapists) {
        console.log(`   - ${therapist.user.name} (${therapist.user.email}) - ${therapist.approvalStatus}`)
      }
    }

    // 부모 목록
    const parents = await prisma.user.findMany({
      where: { role: 'PARENT' },
      select: {
        name: true,
        email: true,
        createdAt: true,
      },
      take: 10,
    })

    console.log(`\n👨‍👩‍👧 부모 목록 (최근 10명):`)
    if (parents.length > 0) {
      for (const parent of parents) {
        console.log(`   - ${parent.name} (${parent.email})`)
      }
    } else {
      console.log('   등록된 부모가 없습니다.')
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
