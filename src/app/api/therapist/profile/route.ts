import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 치료사 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: '치료사 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: '프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('치료사 프로필 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 치료사 프로필 생성/수정
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: '치료사 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const {
      specialty,
      licenseNumber,
      experience,
      education,
      certifications,
      introduction,
      consultationFee
    } = await request.json()

    if (!specialty || !experience || !consultationFee) {
      return NextResponse.json(
        { error: '전문분야, 경력, 상담료는 필수입니다.' },
        { status: 400 }
      )
    }

    // 기존 프로필이 있는지 확인
    const existingProfile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id }
    })

    let profile
    if (existingProfile) {
      // 업데이트
      profile = await prisma.therapistProfile.update({
        where: { userId: session.user.id },
        data: {
          specialty,
          licenseNumber,
          experience: parseInt(experience),
          education,
          certifications,
          introduction,
          consultationFee: parseInt(consultationFee),
          status: 'PENDING' // 수정 시 다시 승인 대기 상태로
        }
      })
    } else {
      // 새로 생성
      profile = await prisma.therapistProfile.create({
        data: {
          userId: session.user.id,
          specialty,
          licenseNumber,
          experience: parseInt(experience),
          education,
          certifications,
          introduction,
          consultationFee: parseInt(consultationFee)
        }
      })
    }

    return NextResponse.json({
      message: '프로필이 저장되었습니다.',
      profile
    })
  } catch (error) {
    console.error('치료사 프로필 저장 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 치료사 프로필 수정
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: '치료사 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const {
      specialty,
      licenseNumber,
      experience,
      education,
      certifications,
      introduction,
      consultationFee
    } = await request.json()

    const profile = await prisma.therapistProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(specialty && { specialty }),
        ...(licenseNumber !== undefined && { licenseNumber }),
        ...(experience && { experience: parseInt(experience) }),
        ...(education !== undefined && { education }),
        ...(certifications !== undefined && { certifications }),
        ...(introduction !== undefined && { introduction }),
        ...(consultationFee && { consultationFee: parseInt(consultationFee) })
      }
    })

    return NextResponse.json({
      message: '프로필이 수정되었습니다.',
      profile
    })
  } catch (error) {
    console.error('치료사 프로필 수정 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}