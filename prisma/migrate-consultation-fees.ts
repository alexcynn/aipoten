import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('===== 언어 컨설팅 비용 마이그레이션 시작 =====\n')

  // 1. 시스템 기본값 조회
  const systemSettings = await prisma.systemSettings.findUnique({
    where: { id: 'system' },
  })

  const defaultFee = systemSettings?.consultationDefaultFee || 150000
  const defaultSettlement = systemSettings?.consultationDefaultSettlement || 100000

  console.log(`📋 시스템 기본값:`)
  console.log(`   - 부모 결제 금액: ${defaultFee.toLocaleString()}원`)
  console.log(`   - 치료사 정산금: ${defaultSettlement.toLocaleString()}원`)
  console.log(`   - 플랫폼 수익: ${(defaultFee - defaultSettlement).toLocaleString()}원\n`)

  // 2. 언어 컨설팅 권한이 있지만 비용이 설정되지 않은 치료사 찾기
  const therapistsWithoutFees = await prisma.therapistProfile.findMany({
    where: {
      canDoConsultation: true,
      OR: [
        { consultationFee: null },
        { consultationSettlementAmount: null },
      ],
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  console.log(`🔍 비용 미설정 치료사 발견: ${therapistsWithoutFees.length}명\n`)

  if (therapistsWithoutFees.length === 0) {
    console.log('✅ 모든 치료사의 언어 컨설팅 비용이 이미 설정되어 있습니다.')
    console.log('\n===== 마이그레이션 완료 =====')
    return
  }

  // 3. 각 치료사의 현재 상태 출력
  console.log('📝 치료사 현재 상태:')
  therapistsWithoutFees.forEach((therapist, index) => {
    console.log(`\n${index + 1}. ${therapist.user.name} (${therapist.user.email})`)
    console.log(`   - 현재 비용: ${therapist.consultationFee?.toLocaleString() || 'null'}원`)
    console.log(`   - 현재 정산금: ${therapist.consultationSettlementAmount?.toLocaleString() || 'null'}원`)
  })

  console.log('\n' + '='.repeat(50))
  console.log('🔄 시스템 기본값으로 자동 설정을 시작합니다...')
  console.log('='.repeat(50) + '\n')

  // 4. 마이그레이션 실행
  let updatedCount = 0
  const errors: string[] = []

  for (const therapist of therapistsWithoutFees) {
    try {
      const updateData: any = {}

      // 비용이 null이면 기본값 설정
      if (therapist.consultationFee === null) {
        updateData.consultationFee = defaultFee
      }

      // 정산금이 null이면 기본값 설정
      if (therapist.consultationSettlementAmount === null) {
        updateData.consultationSettlementAmount = defaultSettlement
      }

      // 업데이트 실행
      const updated = await prisma.therapistProfile.update({
        where: { id: therapist.id },
        data: updateData,
      })

      console.log(`✅ ${therapist.user.name}`)
      console.log(`   → 비용: ${updated.consultationFee?.toLocaleString()}원`)
      console.log(`   → 정산금: ${updated.consultationSettlementAmount?.toLocaleString()}원`)

      updatedCount++
    } catch (error) {
      const errorMsg = `❌ ${therapist.user.name} - ${error}`
      console.error(errorMsg)
      errors.push(errorMsg)
    }
  }

  // 5. 결과 출력
  console.log('\n' + '='.repeat(50))
  console.log('===== 마이그레이션 완료 =====')
  console.log('='.repeat(50))
  console.log(`\n📊 결과 요약:`)
  console.log(`   - 대상 치료사: ${therapistsWithoutFees.length}명`)
  console.log(`   - 성공: ${updatedCount}명`)
  console.log(`   - 실패: ${errors.length}명`)

  if (errors.length > 0) {
    console.log(`\n⚠️  에러 목록:`)
    errors.forEach((error) => console.log(`   ${error}`))
  }

  // 6. 최종 검증
  console.log('\n🔍 최종 검증 중...')
  const remainingWithoutFees = await prisma.therapistProfile.count({
    where: {
      canDoConsultation: true,
      OR: [
        { consultationFee: null },
        { consultationSettlementAmount: null },
      ],
    },
  })

  if (remainingWithoutFees === 0) {
    console.log('✅ 검증 완료: 모든 치료사의 비용이 설정되었습니다.')
  } else {
    console.log(`⚠️  주의: ${remainingWithoutFees}명의 치료사에게 여전히 비용이 설정되지 않았습니다.`)
  }

  console.log('\n===== 마이그레이션 종료 =====')
}

main()
  .catch((e) => {
    console.error('\n❌ 마이그레이션 실행 중 치명적 에러 발생:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
