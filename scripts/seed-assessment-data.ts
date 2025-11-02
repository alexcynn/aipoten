import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAssessmentData() {
  try {
    // 기존 아이 찾기
    const children = await prisma.child.findMany({
      include: { user: true }
    })

    if (children.length === 0) {
      console.log('❌ 아이 데이터가 없습니다. 먼저 부모와 아이를 생성해주세요.')
      return
    }

    console.log(`✅ ${children.length}명의 아이를 찾았습니다.`)

    // 각 아이에 대해 발달체크 생성
    for (const child of children.slice(0, 3)) { // 처음 3명만
      const birthDate = new Date(child.birthDate)
      const now = new Date()
      const ageInMonths = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))

      console.log(`\n📋 ${child.user.name}/${child.name} (${ageInMonths}개월) 발달체크 생성 중...`)

      // 발달체크 생성
      const assessment = await prisma.developmentAssessment.create({
        data: {
          childId: child.id,
          ageInMonths,
          status: 'COMPLETED',
          totalScore: 85.5,
          completedAt: new Date(),
          concernsText: `${child.name}의 발달에 대해 몇 가지 궁금한 점이 있습니다. 특히 또래에 비해 언어 표현이 조금 느린 것 같아서 걱정됩니다.`,
          aiAnalysis: `## 종합 분석

${child.name}(${ageInMonths}개월)의 발달 평가 결과, 전반적으로 양호한 발달 수준을 보이고 있습니다.

### 강점
- 대근육 운동: 또래 수준으로 적절한 신체 활동 능력을 보입니다.
- 소근육 운동: 손가락 사용 및 소근육 조절 능력이 양호합니다.
- 사회성: 타인과의 상호작용이 원활합니다.

### 주의 필요 영역
- 언어 발달: 현재 추적검사가 필요한 수준입니다. 언어 자극을 늘리고, 그림책 읽기 등의 활동을 권장합니다.

### 권장사항
1. 매일 20-30분 그림책 읽어주기
2. 질문과 대답을 유도하는 대화 늘리기
3. 3개월 후 재평가 권장`,
          aiAnalyzedAt: new Date(),
        },
      })

      console.log(`  ✅ 발달체크 생성됨: ${assessment.id}`)

      // 5개 영역별 결과 생성
      const categories = [
        { category: 'GROSS_MOTOR', score: 18, level: 'NORMAL', feedback: '대근육 발달이 또래 수준입니다.', recommendations: '야외 활동을 꾸준히 해주세요.' },
        { category: 'FINE_MOTOR', score: 16, level: 'NORMAL', feedback: '소근육 조절 능력이 양호합니다.', recommendations: '블록 놀이, 그림 그리기를 격려해주세요.' },
        { category: 'COGNITIVE', score: 17, level: 'NORMAL', feedback: '인지 발달이 적절합니다.', recommendations: '문제 해결 놀이를 함께 해보세요.' },
        { category: 'LANGUAGE', score: 12, level: 'NEEDS_TRACKING', feedback: '언어 표현이 다소 느립니다.', recommendations: '그림책 읽기, 질문-대답 놀이를 늘려주세요.' },
        { category: 'SOCIAL', score: 19, level: 'NORMAL', feedback: '사회성 발달이 우수합니다.', recommendations: '또래와의 놀이 기회를 지속해주세요.' },
      ]

      for (const resultData of categories) {
        await prisma.assessmentResult.create({
          data: {
            assessmentId: assessment.id,
            ...resultData,
          },
        })
        console.log(`    - ${resultData.category}: ${resultData.level}`)
      }
    }

    console.log('\n✅ 테스트 데이터 생성 완료!')
    console.log('\n📊 생성된 발달체크 확인:')
    console.log('   관리자 로그인 → 발달체크 현황 메뉴에서 확인하세요.')

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAssessmentData()
