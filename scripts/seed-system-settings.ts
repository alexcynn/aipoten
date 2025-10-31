/**
 * 시스템 설정 및 치료사 매핑 초기 데이터 시딩
 * 실행: npx tsx scripts/seed-system-settings.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSystemSettings() {
  console.log('🌱 시스템 설정 초기화 시작...\n')

  try {
    // 1. 시스템 설정 생성/업데이트
    console.log('📝 시스템 설정 생성 중...')
    const systemSettings = await prisma.systemSettings.upsert({
      where: { id: 'system' },
      update: {
        bankName: '국민은행',
        accountNumber: '123-456-78901',
        accountHolder: '아이포텐',
        consultationBaseFee: 150000,
      },
      create: {
        id: 'system',
        bankName: '국민은행',
        accountNumber: '123-456-78901',
        accountHolder: '아이포텐',
        consultationBaseFee: 150000,
      },
    })
    console.log('✅ 시스템 설정 생성 완료')
    console.log(`   은행: ${systemSettings.bankName}`)
    console.log(`   계좌: ${systemSettings.accountNumber}`)
    console.log(`   예금주: ${systemSettings.accountHolder}`)
    console.log(`   언어 컨설팅 기본 요금: ₩${systemSettings.consultationBaseFee?.toLocaleString()}\n`)

    // 2. 치료사 매핑 데이터 생성
    console.log('📝 치료사 매핑 데이터 생성 중...')

    const mappings = [
      // 대근육 → 감각통합, 작업치료
      { developmentCategory: 'GROSS_MOTOR', therapyType: 'SENSORY_INTEGRATION', priority: 1 },
      { developmentCategory: 'GROSS_MOTOR', therapyType: 'OCCUPATIONAL_THERAPY', priority: 2 },

      // 소근육 → 작업치료, 감각통합
      { developmentCategory: 'FINE_MOTOR', therapyType: 'OCCUPATIONAL_THERAPY', priority: 1 },
      { developmentCategory: 'FINE_MOTOR', therapyType: 'SENSORY_INTEGRATION', priority: 2 },

      // 언어 → 언어치료
      { developmentCategory: 'LANGUAGE', therapyType: 'SPEECH_THERAPY', priority: 1 },

      // 인지 → 인지치료, 작업치료
      { developmentCategory: 'COGNITIVE', therapyType: 'COGNITIVE_THERAPY', priority: 1 },
      { developmentCategory: 'COGNITIVE', therapyType: 'OCCUPATIONAL_THERAPY', priority: 2 },

      // 사회성 → 놀이치료, 행동치료
      { developmentCategory: 'SOCIAL', therapyType: 'PLAY_THERAPY', priority: 1 },
      { developmentCategory: 'SOCIAL', therapyType: 'BEHAVIORAL_THERAPY', priority: 2 },
    ]

    let createdCount = 0
    let updatedCount = 0

    for (const mapping of mappings) {
      const result = await prisma.therapyMapping.upsert({
        where: {
          developmentCategory_therapyType: {
            developmentCategory: mapping.developmentCategory as any,
            therapyType: mapping.therapyType as any,
          },
        },
        update: {
          priority: mapping.priority,
          isActive: true,
        },
        create: {
          developmentCategory: mapping.developmentCategory as any,
          therapyType: mapping.therapyType as any,
          priority: mapping.priority,
          isActive: true,
        },
      })

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        createdCount++
      } else {
        updatedCount++
      }
    }

    console.log(`✅ 치료사 매핑 생성 완료`)
    console.log(`   생성: ${createdCount}개`)
    console.log(`   업데이트: ${updatedCount}개\n`)

    // 3. 매핑 데이터 확인
    console.log('📊 현재 치료사 매핑:')
    const allMappings = await prisma.therapyMapping.findMany({
      orderBy: [{ developmentCategory: 'asc' }, { priority: 'asc' }],
    })

    const categoryLabels: Record<string, string> = {
      GROSS_MOTOR: '대근육',
      FINE_MOTOR: '소근육',
      LANGUAGE: '언어',
      COGNITIVE: '인지',
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
    for (const mapping of allMappings) {
      if (mapping.developmentCategory !== currentCategory) {
        currentCategory = mapping.developmentCategory
        console.log(`\n   [${categoryLabels[currentCategory]}]`)
      }
      console.log(`     ${mapping.priority}순위: ${therapyLabels[mapping.therapyType]}`)
    }

    console.log('\n🎉 모든 초기 데이터가 성공적으로 생성되었습니다!')
    console.log('\n📝 관리자 페이지에서 확인하세요:')
    console.log('   http://localhost:3000/admin/settings')
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedSystemSettings()
