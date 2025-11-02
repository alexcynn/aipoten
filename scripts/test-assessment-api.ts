import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAPI() {
  try {
    const startDateParam = '2025-10-03'
    const endDateParam = '2025-11-02'

    const where: any = {
      status: 'COMPLETED',
    }

    // 날짜 범위 필터링
    if (startDateParam || endDateParam) {
      where.completedAt = {}

      if (startDateParam) {
        const startDate = new Date(startDateParam)
        startDate.setHours(0, 0, 0, 0)
        where.completedAt.gte = startDate
        console.log('Start filter:', startDate)
      }

      if (endDateParam) {
        const endDate = new Date(endDateParam)
        endDate.setHours(23, 59, 59, 999)
        where.completedAt.lte = endDate
        console.log('End filter:', endDate)
      }
    }

    console.log('\nWhere clause:', JSON.stringify(where, null, 2))

    const assessments = await prisma.developmentAssessment.findMany({
      where,
      include: {
        child: {
          select: {
            id: true,
            name: true,
            gender: true,
            birthDate: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        results: {
          select: {
            category: true,
            level: true,
            feedback: true,
            recommendations: true,
          },
          orderBy: {
            category: 'asc',
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    console.log(`\n✅ Found ${assessments.length} assessments`)

    assessments.forEach((a, i) => {
      console.log(`\n${i + 1}. ${a.child.user.name}/${a.child.name}`)
      console.log(`   - ID: ${a.id}`)
      console.log(`   - Completed: ${a.completedAt}`)
      console.log(`   - Age: ${a.ageInMonths}개월`)
      console.log(`   - Results: ${a.results.length}개`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI()
