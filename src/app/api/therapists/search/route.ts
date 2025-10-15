import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/therapists/search
 * 부모가 치료사를 검색하는 API
 *
 * Query Parameters:
 * - specialty: 전문 분야 (예: "SPEECH_THERAPY", "SENSORY_INTEGRATION")
 * - serviceArea: 서비스 지역 (예: "GANGNAM", "SEOCHO")
 * - childAgeRange: 아이 연령 범위 (예: "AGE_0_12", "AGE_13_24")
 * - startDate: 가용성 검색 시작 날짜 (예: "2025-11-01")
 * - endDate: 가용성 검색 종료 날짜 (예: "2025-11-30")
 * - minFee: 최소 상담료
 * - maxFee: 최대 상담료
 * - gender: 성별 (MALE, FEMALE)
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 결과 수 (기본값: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 검색 파라미터
    const specialty = searchParams.get('specialty')
    const serviceArea = searchParams.get('serviceArea')
    const childAgeRange = searchParams.get('childAgeRange')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minFee = searchParams.get('minFee')
    const maxFee = searchParams.get('maxFee')
    const gender = searchParams.get('gender')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('📥 치료사 검색 요청:', {
      specialty,
      serviceArea,
      childAgeRange,
      startDate,
      endDate,
      minFee,
      maxFee,
      gender,
      page,
      limit
    })

    // 기본 조회 조건: 승인된 치료사만
    const where: any = {
      approvalStatus: 'APPROVED'
    }

    // 전문 분야 필터
    if (specialty) {
      where.specialties = {
        contains: specialty
      }
    }

    // 서비스 지역 필터
    if (serviceArea) {
      where.serviceAreas = {
        contains: serviceArea
      }
    }

    // 아이 연령 범위 필터
    if (childAgeRange) {
      where.childAgeRanges = {
        contains: childAgeRange
      }
    }

    // 상담료 필터
    if (minFee || maxFee) {
      where.sessionFee = {}
      if (minFee) {
        where.sessionFee.gte = parseInt(minFee)
      }
      if (maxFee) {
        where.sessionFee.lte = parseInt(maxFee)
      }
    }

    // 성별 필터
    if (gender) {
      where.gender = gender
    }

    console.log('🔍 검색 조건:', JSON.stringify(where, null, 2))

    // 가용성 필터 (날짜 범위가 지정된 경우)
    let therapistIdsWithAvailability: string[] | undefined

    if (startDate && endDate) {
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number)

      const start = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0))
      const end = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999))

      console.log('📅 가용성 검색 날짜 범위:', {
        start: start.toISOString(),
        end: end.toISOString()
      })

      // 해당 기간에 가용한 슬롯이 있는 치료사 찾기
      const availableSlots = await prisma.timeSlot.findMany({
        where: {
          date: {
            gte: start,
            lte: end
          },
          isAvailable: true,
          isHoliday: false,
          isBufferBlocked: false,
          currentBookings: 0
        },
        select: {
          therapistId: true
        },
        distinct: ['therapistId']
      })

      therapistIdsWithAvailability = availableSlots.map(slot => slot.therapistId)

      console.log(`✅ ${therapistIdsWithAvailability.length}명의 치료사가 해당 기간에 가용`)

      // 가용한 치료사가 없으면 빈 결과 반환
      if (therapistIdsWithAvailability.length === 0) {
        return NextResponse.json({
          therapists: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalCount: 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        })
      }

      // where 조건에 치료사 ID 필터 추가
      where.id = {
        in: therapistIdsWithAvailability
      }
    }

    // 전체 카운트 조회
    const totalCount = await prisma.therapistProfile.count({ where })
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    console.log('📊 검색 통계:', {
      totalCount,
      totalPages,
      currentPage: page,
      limit
    })

    // 치료사 조회
    const therapists = await prisma.therapistProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        certifications: {
          orderBy: {
            issueDate: 'desc'
          }
        },
        experiences: {
          orderBy: {
            startDate: 'desc'
          }
        },
        // 가용한 타임슬롯 수 계산을 위해 포함
        ...(startDate && endDate ? {
          timeSlots: {
            where: {
              date: {
                gte: new Date(Date.UTC(
                  parseInt(startDate.split('-')[0]),
                  parseInt(startDate.split('-')[1]) - 1,
                  parseInt(startDate.split('-')[2]),
                  0, 0, 0, 0
                )),
                lte: new Date(Date.UTC(
                  parseInt(endDate.split('-')[0]),
                  parseInt(endDate.split('-')[1]) - 1,
                  parseInt(endDate.split('-')[2]),
                  23, 59, 59, 999
                ))
              },
              isAvailable: true,
              isHoliday: false,
              isBufferBlocked: false,
              currentBookings: 0
            },
            select: {
              id: true,
              date: true,
              startTime: true,
              endTime: true
            }
          }
        } : {})
      },
      skip,
      take: limit,
      orderBy: [
        { sessionFee: 'asc' }, // 상담료 낮은 순
        { createdAt: 'desc' }  // 최신 등록순
      ]
    })

    console.log(`✅ ${therapists.length}명의 치료사 조회 완료`)

    // 응답 데이터 가공
    const response = therapists.map(therapist => ({
      id: therapist.id,
      user: therapist.user,
      gender: therapist.gender,
      birthYear: therapist.birthYear,
      address: therapist.address,
      addressDetail: therapist.addressDetail,
      specialties: therapist.specialties ? JSON.parse(therapist.specialties) : [],
      childAgeRanges: therapist.childAgeRanges ? JSON.parse(therapist.childAgeRanges) : [],
      serviceAreas: therapist.serviceAreas ? JSON.parse(therapist.serviceAreas) : [],
      sessionFee: therapist.sessionFee,
      education: therapist.education,
      introduction: therapist.introduction,
      approvedAt: therapist.approvedAt,
      certifications: therapist.certifications,
      experiences: therapist.experiences,
      // 가용 슬롯 정보 (날짜 범위 검색 시)
      ...(startDate && endDate && 'timeSlots' in therapist ? {
        availableSlots: therapist.timeSlots,
        availableSlotsCount: therapist.timeSlots?.length || 0
      } : {})
    }))

    return NextResponse.json({
      therapists: response,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    })

  } catch (error) {
    console.error('❌ 치료사 검색 오류:', error)
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
