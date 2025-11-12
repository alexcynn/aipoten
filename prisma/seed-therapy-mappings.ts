import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('치료사 매핑 데이터 시드 시작...')

  // 권장 매핑 (일반적인 발달 치료 매핑)
  const mappings = [
    // 대근육 (GROSS_MOTOR)
    { developmentCategory: 'GROSS_MOTOR', therapyType: 'SENSORY_INTEGRATION', priority: 1 },
    { developmentCategory: 'GROSS_MOTOR', therapyType: 'PLAY_THERAPY', priority: 2 },
    { developmentCategory: 'GROSS_MOTOR', therapyType: 'OCCUPATIONAL_THERAPY', priority: 3 },

    // 소근육 (FINE_MOTOR)
    { developmentCategory: 'FINE_MOTOR', therapyType: 'OCCUPATIONAL_THERAPY', priority: 1 },
    { developmentCategory: 'FINE_MOTOR', therapyType: 'SENSORY_INTEGRATION', priority: 2 },
    { developmentCategory: 'FINE_MOTOR', therapyType: 'ART_THERAPY', priority: 3 },

    // 인지 (COGNITIVE)
    { developmentCategory: 'COGNITIVE', therapyType: 'COGNITIVE_THERAPY', priority: 1 },
    { developmentCategory: 'COGNITIVE', therapyType: 'PLAY_THERAPY', priority: 2 },
    { developmentCategory: 'COGNITIVE', therapyType: 'SPEECH_THERAPY', priority: 3 },

    // 언어 (LANGUAGE)
    { developmentCategory: 'LANGUAGE', therapyType: 'SPEECH_THERAPY', priority: 1 },
    { developmentCategory: 'LANGUAGE', therapyType: 'PLAY_THERAPY', priority: 2 },
    { developmentCategory: 'LANGUAGE', therapyType: 'MUSIC_THERAPY', priority: 3 },

    // 사회성 (SOCIAL)
    { developmentCategory: 'SOCIAL', therapyType: 'PLAY_THERAPY', priority: 1 },
    { developmentCategory: 'SOCIAL', therapyType: 'BEHAVIORAL_THERAPY', priority: 2 },
    { developmentCategory: 'SOCIAL', therapyType: 'SPEECH_THERAPY', priority: 3 },
  ]

  let createdCount = 0
  let skippedCount = 0

  for (const mapping of mappings) {
    try {
      // 중복 확인
      const existing = await prisma.therapyMapping.findUnique({
        where: {
          developmentCategory_therapyType: {
            developmentCategory: mapping.developmentCategory,
            therapyType: mapping.therapyType,
          },
        },
      })

      if (existing) {
        console.log(`이미 존재: ${mapping.developmentCategory} - ${mapping.therapyType}`)
        skippedCount++
        continue
      }

      // 매핑 생성
      await prisma.therapyMapping.create({
        data: {
          developmentCategory: mapping.developmentCategory,
          therapyType: mapping.therapyType,
          priority: mapping.priority,
          isActive: true,
        },
      })

      console.log(`생성됨: ${mapping.developmentCategory} - ${mapping.therapyType}`)
      createdCount++
    } catch (error) {
      console.error(`에러 발생: ${mapping.developmentCategory} - ${mapping.therapyType}`, error)
    }
  }

  console.log(`\n치료사 매핑 시드 완료!`)
  console.log(`생성: ${createdCount}개`)
  console.log(`건너뜀: ${skippedCount}개`)
}

main()
  .catch((e) => {
    console.error('시드 실행 중 에러:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
