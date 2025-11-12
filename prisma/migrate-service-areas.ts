import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 구 이름 매핑 (영문 → 한글 → 전체 주소)
const DISTRICT_MAPPING: Record<string, string> = {
  // 서울특별시
  'GANGNAM': '서울특별시 강남구',
  '강남구': '서울특별시 강남구',
  '서울시 강남구': '서울특별시 강남구',
  'SEOCHO': '서울특별시 서초구',
  '서초구': '서울특별시 서초구',
  '서울시 서초구': '서울특별시 서초구',
  'SONGPA': '서울특별시 송파구',
  '송파구': '서울특별시 송파구',
  '서울시 송파구': '서울특별시 송파구',
  'GANGDONG': '서울특별시 강동구',
  '강동구': '서울특별시 강동구',
  'GWANGJIN': '서울특별시 광진구',
  '광진구': '서울특별시 광진구',
  'SEONGDONG': '서울특별시 성동구',
  '성동구': '서울특별시 성동구',
  'JUNGGU': '서울특별시 중구',
  '중구': '서울특별시 중구',
  'YONGSAN': '서울특별시 용산구',
  '용산구': '서울특별시 용산구',
  'MAPO': '서울특별시 마포구',
  '마포구': '서울특별시 마포구',
  'SEODAEMUN': '서울특별시 서대문구',
  '서대문구': '서울특별시 서대문구',
  'EUNPYEONG': '서울특별시 은평구',
  '은평구': '서울특별시 은평구',
  'JONGNO': '서울특별시 종로구',
  '종로구': '서울특별시 종로구',
  'GANGBUK': '서울특별시 강북구',
  '강북구': '서울특별시 강북구',
  'SEONGBUK': '서울특별시 성북구',
  '성북구': '서울특별시 성북구',
  'NOWON': '서울특별시 노원구',
  '노원구': '서울특별시 노원구',
  'DOBONG': '서울특별시 도봉구',
  '도봉구': '서울특별시 도봉구',
  'JUNGNANG': '서울특별시 중랑구',
  '중랑구': '서울특별시 중랑구',
  'DONGDAEMUN': '서울특별시 동대문구',
  '동대문구': '서울특별시 동대문구',
  'GWANAK': '서울특별시 관악구',
  '관악구': '서울특별시 관악구',
  'DONGJAK': '서울특별시 동작구',
  '동작구': '서울특별시 동작구',
  'YEONGDEUNGPO': '서울특별시 영등포구',
  '영등포구': '서울특별시 영등포구',
  'GANGSEO': '서울특별시 강서구',
  '강서구': '서울특별시 강서구',
  'GURO': '서울특별시 구로구',
  '구로구': '서울특별시 구로구',
  'GEUMCHEON': '서울특별시 금천구',
  '금천구': '서울특별시 금천구',
  'YANGCHEON': '서울특별시 양천구',
  '양천구': '서울특별시 양천구',

  // 경기도 주요 시/구
  'SUWON': '경기도 수원시',
  '수원시': '경기도 수원시',
  'SEONGNAM': '경기도 성남시',
  '성남시': '경기도 성남시',
  'BUNDANG': '경기도 성남시 분당구',
  '분당구': '경기도 성남시 분당구',
  'YONGIN': '경기도 용인시',
  '용인시': '경기도 용인시',
  'GOYANG': '경기도 고양시',
  '고양시': '경기도 고양시',
  'ILSAN': '경기도 고양시 일산동구',
  '일산동구': '경기도 고양시 일산동구',
  'ANYANG': '경기도 안양시',
  '안양시': '경기도 안양시',
  'BUCHEON': '경기도 부천시',
  '부천시': '경기도 부천시',
  'ANSAN': '경기도 안산시',
  '안산시': '경기도 안산시',
  'NAMYANGJU': '경기도 남양주시',
  '남양주시': '경기도 남양주시',
  'HWASEONG': '경기도 화성시',
  '화성시': '경기도 화성시',
  'PYEONGTAEK': '경기도 평택시',
  '평택시': '경기도 평택시',
  'UIJEONGBU': '경기도 의정부시',
  '의정부시': '경기도 의정부시',
  'SIHEUNG': '경기도 시흥시',
  '시흥시': '경기도 시흥시',
  'GWANGMYEONG': '경기도 광명시',
  '광명시': '경기도 광명시',
  'GUNPO': '경기도 군포시',
  '군포시': '경기도 군포시',
  'HANAM': '경기도 하남시',
  '하남시': '경기도 하남시',
  'OSAN': '경기도 오산시',
  '오산시': '경기도 오산시',
  'YANGJU': '경기도 양주시',
  '양주시': '경기도 양주시',
  'ICHEON': '경기도 이천시',
  '이천시': '경기도 이천시',
  'PAJU': '경기도 파주시',
  '파주시': '경기도 파주시',
  'GIMPO': '경기도 김포시',
  '김포시': '경기도 김포시',

  // 인천광역시
  'INCHEON': '인천광역시',
  '인천광역시': '인천광역시',
  'BUPYEONG': '인천광역시 부평구',
  '부평구': '인천광역시 부평구',
  'NAMDONG': '인천광역시 남동구',
  '남동구': '인천광역시 남동구',
  'YEONSU': '인천광역시 연수구',
  '연수구': '인천광역시 연수구',
  'SEOGU_INCHEON': '인천광역시 서구',

  // 기타 광역시
  'BUSAN': '부산광역시',
  '부산광역시': '부산광역시',
  'DAEGU': '대구광역시',
  '대구광역시': '대구광역시',
  'DAEJEON': '대전광역시',
  '대전광역시': '대전광역시',
  'GWANGJU': '광주광역시',
  '광주광역시': '광주광역시',
  'ULSAN': '울산광역시',
  '울산광역시': '울산광역시',
}

async function migrateServiceAreas() {
  console.log('🔄 서비스 지역 데이터 마이그레이션 시작...')

  try {
    // 모든 치료사 프로필 조회
    const therapists = await prisma.therapistProfile.findMany({
      where: {
        serviceAreas: {
          not: null
        }
      },
      select: {
        id: true,
        serviceAreas: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`📊 총 ${therapists.length}개의 치료사 프로필을 확인합니다...`)

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const therapist of therapists) {
      try {
        if (!therapist.serviceAreas) {
          skippedCount++
          continue
        }

        // JSON 파싱
        const currentAreas: string[] = JSON.parse(therapist.serviceAreas)

        // 이미 전체 주소 형식인지 확인 (서울특별시, 경기도, 인천광역시 등으로 시작)
        const isAlreadyConverted = currentAreas.every(area =>
          area.includes('특별시') ||
          area.includes('광역시') ||
          area.includes('경기도') ||
          area.includes('강원도') ||
          area.includes('충청') ||
          area.includes('전라') ||
          area.includes('경상') ||
          area.includes('제주')
        )

        if (isAlreadyConverted) {
          console.log(`✅ [${therapist.user.name}] 이미 변환된 데이터: ${currentAreas.join(', ')}`)
          skippedCount++
          continue
        }

        // 변환 로직
        const convertedAreas: string[] = []
        const unmappedAreas: string[] = []

        for (const area of currentAreas) {
          const mappedArea = DISTRICT_MAPPING[area]
          if (mappedArea) {
            convertedAreas.push(mappedArea)
          } else {
            unmappedAreas.push(area)
            console.warn(`⚠️ [${therapist.user.name}] 매핑되지 않은 지역: ${area}`)
          }
        }

        // 매핑되지 않은 지역도 그대로 유지 (데이터 손실 방지)
        const finalAreas = [...convertedAreas, ...unmappedAreas]

        if (finalAreas.length === 0) {
          console.log(`⏭️  [${therapist.user.name}] 변환할 데이터가 없습니다.`)
          skippedCount++
          continue
        }

        // 중복 제거
        const uniqueAreas = Array.from(new Set(finalAreas))

        // 업데이트
        await prisma.therapistProfile.update({
          where: { id: therapist.id },
          data: {
            serviceAreas: JSON.stringify(uniqueAreas)
          }
        })

        console.log(`✅ [${therapist.user.name}] 변환 완료:`)
        console.log(`   변경 전: ${currentAreas.join(', ')}`)
        console.log(`   변경 후: ${uniqueAreas.join(', ')}`)

        if (unmappedAreas.length > 0) {
          console.log(`   ⚠️  매핑 안된 지역: ${unmappedAreas.join(', ')}`)
        }

        updatedCount++

      } catch (error) {
        console.error(`❌ [${therapist.user.name}] 업데이트 실패:`, error)
        errorCount++
      }
    }

    console.log('\n📊 마이그레이션 결과:')
    console.log(`  ✅ 업데이트: ${updatedCount}개`)
    console.log(`  ⏭️  건너뜀: ${skippedCount}개`)
    console.log(`  ❌ 실패: ${errorCount}개`)
    console.log('\n✨ 마이그레이션 완료!')

  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 실행
migrateServiceAreas()
  .then(() => {
    console.log('✅ 스크립트 종료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 스크립트 실행 실패:', error)
    process.exit(1)
  })
