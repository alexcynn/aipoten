import { prisma } from '../src/lib/prisma'

async function debugVideoMatching() {
  // 아이 ID를 찾기
  const child = await prisma.child.findFirst({
    orderBy: { createdAt: 'desc' }
  })

  if (!child) {
    console.log('아이 정보 없음')
    return
  }

  console.log(`아이: ${child.name}`)
  console.log(`생년월일: ${child.birthDate}`)

  // 월령 계산
  const birthDate = new Date(child.birthDate)
  const today = new Date()
  const ageInMonths = Math.floor(
    (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  )
  console.log(`월령: ${ageInMonths}개월\n`)

  // 최근 발달체크
  const assessment = await prisma.developmentAssessment.findFirst({
    where: {
      childId: child.id,
      status: 'COMPLETED'
    },
    include: { results: true },
    orderBy: { completedAt: 'desc' }
  })

  if (!assessment) {
    console.log('완료된 발달체크 없음')
    return
  }

  // 취약 영역 찾기
  const needsAssessment: string[] = []
  const needsTracking: string[] = []

  assessment.results.forEach(result => {
    if (result.level === 'NEEDS_ASSESSMENT') {
      needsAssessment.push(result.category)
    } else if (result.level === 'NEEDS_TRACKING') {
      needsTracking.push(result.category)
    }
  })

  const priorityCategories = needsAssessment.length > 0 ? needsAssessment : needsTracking

  console.log('취약 영역:')
  console.log(`  NEEDS_ASSESSMENT: ${needsAssessment.join(', ') || '없음'}`)
  console.log(`  NEEDS_TRACKING: ${needsTracking.join(', ') || '없음'}`)
  console.log(`  우선순위 카테고리: ${priorityCategories.join(', ')}\n`)

  // 모든 영상 조회
  const allVideos = await prisma.video.findMany({
    where: { isPublished: true }
  })

  console.log('=== 영상 매칭 결과 ===\n')

  for (const video of allVideos) {
    const categories = video.developmentCategories
      ? JSON.parse(video.developmentCategories)
      : []

    // 배열인지 확인
    const categoryArray = Array.isArray(categories) ? categories : [categories]

    const ageMatch = ageInMonths >= video.targetAgeMin && ageInMonths <= video.targetAgeMax
    const categoryMatch = categoryArray.some((cat: string) => priorityCategories.includes(cat))

    console.log(`제목: ${video.title}`)
    console.log(`  카테고리 원본: ${video.developmentCategories}`)
    console.log(`  카테고리 파싱: ${JSON.stringify(categoryArray)}`)
    console.log(`  대상연령: ${video.targetAgeMin}-${video.targetAgeMax}개월`)
    console.log(`  연령 매칭: ${ageMatch ? '✅' : '❌'} (현재 ${ageInMonths}개월)`)
    console.log(`  카테고리 매칭: ${categoryMatch ? '✅' : '❌'}`)
    console.log(`  최종 표시: ${ageMatch && categoryMatch ? '✅ 표시됨' : '❌ 표시안됨'}\n`)
  }
}

debugVideoMatching()
  .catch(console.error)
  .finally(() => process.exit(0))
