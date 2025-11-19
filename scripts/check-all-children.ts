import { prisma } from '../src/lib/prisma'

async function checkAll() {
  const children = await prisma.child.findMany({
    include: {
      assessments: {
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 1,
        include: { results: true }
      }
    }
  })

  console.log('=== 모든 아이와 발달체크 현황 ===\n')

  for (const child of children) {
    const birthDate = new Date(child.birthDate)
    const today = new Date()
    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))

    console.log(`아이: ${child.name}`)
    console.log(`  ID: ${child.id}`)
    console.log(`  월령: ${ageInMonths}개월`)

    if (child.assessments.length > 0) {
      const assessment = child.assessments[0]
      const weak: string[] = []

      assessment.results.forEach(r => {
        if (r.level === 'NEEDS_ASSESSMENT' || r.level === 'NEEDS_TRACKING') {
          weak.push(r.category)
        }
      })

      console.log(`  발달체크: 완료`)
      console.log(`  취약 영역: ${weak.length > 0 ? weak.join(', ') : '없음'}`)
    } else {
      console.log(`  발달체크: 없음`)
    }
    console.log('')
  }

  // 영상 연령대 확인
  console.log('\n=== 영상 연령대 현황 ===\n')
  const videos = await prisma.video.findMany({
    where: { isPublished: true }
  })

  for (const video of videos) {
    console.log(`${video.title}: ${video.targetAgeMin}-${video.targetAgeMax}개월`)
  }
}

checkAll()
  .catch(console.error)
  .finally(() => process.exit(0))
