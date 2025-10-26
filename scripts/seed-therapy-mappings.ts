import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 기본 치료사 매핑 데이터
 * 발달 영역별로 추천되는 치료 분야
 */
const DEFAULT_MAPPINGS = [
  // 대근육 (GROSS_MOTOR)
  { category: 'GROSS_MOTOR', therapyType: 'SENSORY_INTEGRATION', priority: 1 },
  { category: 'GROSS_MOTOR', therapyType: 'OCCUPATIONAL_THERAPY', priority: 2 },
  { category: 'GROSS_MOTOR', therapyType: 'PLAY_THERAPY', priority: 3 },

  // 소근육 (FINE_MOTOR)
  { category: 'FINE_MOTOR', therapyType: 'OCCUPATIONAL_THERAPY', priority: 1 },
  { category: 'FINE_MOTOR', therapyType: 'SENSORY_INTEGRATION', priority: 2 },
  { category: 'FINE_MOTOR', therapyType: 'ART_THERAPY', priority: 3 },

  // 인지 (COGNITIVE)
  { category: 'COGNITIVE', therapyType: 'COGNITIVE_THERAPY', priority: 1 },
  { category: 'COGNITIVE', therapyType: 'PLAY_THERAPY', priority: 2 },
  { category: 'COGNITIVE', therapyType: 'SPEECH_THERAPY', priority: 3 },

  // 언어 (LANGUAGE)
  { category: 'LANGUAGE', therapyType: 'SPEECH_THERAPY', priority: 1 },
  { category: 'LANGUAGE', therapyType: 'PLAY_THERAPY', priority: 2 },
  { category: 'LANGUAGE', therapyType: 'COGNITIVE_THERAPY', priority: 3 },

  // 사회성 (SOCIAL)
  { category: 'SOCIAL', therapyType: 'PLAY_THERAPY', priority: 1 },
  { category: 'SOCIAL', therapyType: 'BEHAVIORAL_THERAPY', priority: 2 },
  { category: 'SOCIAL', therapyType: 'SPEECH_THERAPY', priority: 3 },
]

async function main() {
  console.log('🔄 기본 치료사 매핑 데이터 생성 시작...')

  // 시스템 설정 초기화 (계좌 정보)
  const systemSettings = await prisma.systemSettings.upsert({
    where: { id: 'system' },
    update: {},
    create: {
      id: 'system',
      bankName: '국민은행',
      accountNumber: '123-456-789012',
      accountHolder: '(주)아이포텐',
      consultationBaseFee: 150000,
    },
  })
  console.log('✅ 시스템 설정 초기화 완료:', systemSettings)

  // 기존 매핑 삭제 (선택사항)
  const deleteResult = await prisma.therapyMapping.deleteMany({})
  console.log(`🗑️  기존 매핑 ${deleteResult.count}개 삭제 완료`)

  // 기본 매핑 생성
  let createdCount = 0
  for (const mapping of DEFAULT_MAPPINGS) {
    await prisma.therapyMapping.create({
      data: {
        developmentCategory: mapping.category as any,
        therapyType: mapping.therapyType as any,
        priority: mapping.priority,
        isActive: true,
      },
    })
    createdCount++
  }

  console.log(`✅ 치료사 매핑 ${createdCount}개 생성 완료`)

  // 생성된 매핑 확인
  const allMappings = await prisma.therapyMapping.findMany({
    orderBy: [
      { developmentCategory: 'asc' },
      { priority: 'asc' },
    ],
  })

  console.log('\n📋 생성된 매핑 목록:')
  const categoryLabels: Record<string, string> = {
    GROSS_MOTOR: '대근육',
    FINE_MOTOR: '소근육',
    COGNITIVE: '인지',
    LANGUAGE: '언어',
    SOCIAL: '사회성',
  }
  const therapyLabels: Record<string, string> = {
    SPEECH_THERAPY: '언어치료',
    SENSORY_INTEGRATION: '감각통합',
    PLAY_THERAPY: '놀이치료',
    ART_THERAPY: '미술치료',
    MUSIC_THERAPY: '음악치료',
    OCCUPATIONAL_THERAPY: '작업치료',
    COGNITIVE_THERAPY: '인지치료',
    BEHAVIORAL_THERAPY: '행동치료',
  }

  let currentCategory = ''
  allMappings.forEach((mapping) => {
    if (currentCategory !== mapping.developmentCategory) {
      currentCategory = mapping.developmentCategory
      console.log(`\n${categoryLabels[currentCategory] || currentCategory}:`)
    }
    console.log(
      `  ${mapping.priority}. ${therapyLabels[mapping.therapyType] || mapping.therapyType}`
    )
  })

  console.log('\n✅ 모든 작업 완료!')
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
