import { prisma } from '../src/lib/prisma'

async function checkVideoMatching() {
  console.log('=== 영상 추천 매칭 데이터 확인 ===\n')

  // 1. 최근 완료된 발달체크 결과 조회
  const recentAssessments = await prisma.developmentAssessment.findMany({
    where: { status: 'COMPLETED' },
    include: {
      child: true,
      results: true
    },
    orderBy: { completedAt: 'desc' },
    take: 3
  })

  console.log('📊 최근 발달체크 결과:')
  console.log('---')

  for (const assessment of recentAssessments) {
    console.log(`\n아이: ${assessment.child.name}`)
    console.log(`완료일: ${assessment.completedAt}`)
    console.log('결과:')

    const needsAssessment: string[] = []
    const needsTracking: string[] = []
    const normal: string[] = []

    assessment.results.forEach(result => {
      const categoryKorean: Record<string, string> = {
        'GROSS_MOTOR': '대근육',
        'FINE_MOTOR': '소근육',
        'COGNITIVE': '인지',
        'LANGUAGE': '언어',
        'SOCIAL': '사회성',
        'EMOTIONAL': '정서'
      }
      const name = categoryKorean[result.category] || result.category

      if (result.level === 'NEEDS_ASSESSMENT') {
        needsAssessment.push(name)
      } else if (result.level === 'NEEDS_TRACKING') {
        needsTracking.push(name)
      } else {
        normal.push(name)
      }

      console.log(`  - ${name}: ${result.level}`)
    })

    console.log('\n  [요약]')
    if (needsAssessment.length > 0) {
      console.log(`  🔴 전문가 상담 필요 (NEEDS_ASSESSMENT): ${needsAssessment.join(', ')}`)
    }
    if (needsTracking.length > 0) {
      console.log(`  🟡 관심 필요 (NEEDS_TRACKING): ${needsTracking.join(', ')}`)
    }
    if (normal.length > 0) {
      console.log(`  🟢 정상: ${normal.join(', ')}`)
    }
  }

  // 2. 영상 데이터 조회
  console.log('\n\n📹 등록된 영상의 발달 카테고리:')
  console.log('---')

  const videos = await prisma.video.findMany({
    where: { isPublished: true },
    orderBy: { priority: 'desc' }
  })

  if (videos.length === 0) {
    console.log('등록된 공개 영상이 없습니다.')
  } else {
    const categoryCount: Record<string, number> = {
      'GROSS_MOTOR': 0,
      'FINE_MOTOR': 0,
      'COGNITIVE': 0,
      'LANGUAGE': 0,
      'SOCIAL': 0,
      'EMOTIONAL': 0
    }

    for (const video of videos) {
      const categories = video.developmentCategories
        ? JSON.parse(video.developmentCategories)
        : []

      console.log(`\n제목: ${video.title}`)
      console.log(`  카테고리: ${categories.length > 0 ? categories.join(', ') : '(없음)'}`)
      console.log(`  대상연령: ${video.targetAgeMin}-${video.targetAgeMax}개월`)
      console.log(`  우선순위: ${video.priority}`)

      categories.forEach((cat: string) => {
        if (categoryCount[cat] !== undefined) {
          categoryCount[cat]++
        }
      })
    }

    console.log('\n\n📈 카테고리별 영상 수:')
    console.log('---')
    const categoryKorean: Record<string, string> = {
      'GROSS_MOTOR': '대근육',
      'FINE_MOTOR': '소근육',
      'COGNITIVE': '인지',
      'LANGUAGE': '언어',
      'SOCIAL': '사회성',
      'EMOTIONAL': '정서'
    }

    Object.entries(categoryCount).forEach(([cat, count]) => {
      const korean = categoryKorean[cat] || cat
      const bar = '█'.repeat(count) || '(없음)'
      console.log(`  ${korean}: ${count}개 ${bar}`)
    })
  }

  console.log('\n=== 확인 완료 ===')
}

checkVideoMatching()
  .catch(console.error)
  .finally(() => process.exit(0))
