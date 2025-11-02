import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAssessments() {
  try {
    // 전체 발달체크 수
    const totalCount = await prisma.developmentAssessment.count()
    console.log(`📊 전체 발달체크 수: ${totalCount}`)

    // 완료된 발달체크 수
    const completedCount = await prisma.developmentAssessment.count({
      where: { status: 'COMPLETED' }
    })
    console.log(`✅ 완료된 발달체크 수: ${completedCount}`)

    // 진행 중인 발달체크 수
    const inProgressCount = await prisma.developmentAssessment.count({
      where: { status: 'IN_PROGRESS' }
    })
    console.log(`⏳ 진행 중인 발달체크 수: ${inProgressCount}`)

    // 최근 5개 발달체크 목록
    const recentAssessments = await prisma.developmentAssessment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        child: {
          select: {
            name: true,
            gender: true,
            user: {
              select: { name: true }
            }
          }
        }
      }
    })

    console.log('\n📋 최근 5개 발달체크:')
    recentAssessments.forEach((assessment, index) => {
      console.log(`${index + 1}. ${assessment.child.user.name}/${assessment.child.name} - ${assessment.status} (${new Date(assessment.createdAt).toLocaleDateString('ko-KR')})`)
    })

    // 완료된 발달체크 샘플
    if (completedCount > 0) {
      console.log('\n✅ 완료된 발달체크 샘플:')
      const completedSample = await prisma.developmentAssessment.findFirst({
        where: { status: 'COMPLETED' },
        include: {
          child: {
            select: {
              name: true,
              user: { select: { name: true } }
            }
          },
          results: true
        }
      })

      if (completedSample) {
        console.log(`- ID: ${completedSample.id}`)
        console.log(`- 아이: ${completedSample.child.name}`)
        console.log(`- 부모: ${completedSample.child.user.name}`)
        console.log(`- 완료일: ${completedSample.completedAt}`)
        console.log(`- 결과 수: ${completedSample.results.length}`)
      }
    }

  } catch (error) {
    console.error('오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAssessments()
