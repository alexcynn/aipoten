import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 상담 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const consultation = await prisma.consultation.findFirst({
      where: {
        id: params.id,
        therapist: {
          userId: session.user.id
        }
      },
      include: {
        parentUser: {
          select: {
            name: true,
            email: true
          }
        },
        child: {
          select: {
            name: true
          }
        }
      }
    })

    if (!consultation) {
      return NextResponse.json(
        { error: '상담을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const formattedConsultation = {
      id: consultation.id,
      childName: consultation.child.name,
      parentName: consultation.parentUser.name,
      parentEmail: consultation.parentUser.email,
      scheduledAt: consultation.scheduledAt.toISOString(),
      duration: consultation.duration,
      type: consultation.type,
      status: consultation.status,
      fee: consultation.fee,
      paymentStatus: consultation.paymentStatus,
      notes: consultation.notes,
      feedback: consultation.feedback
    }

    return NextResponse.json(formattedConsultation)
  } catch (error) {
    console.error('상담 상세 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 상담 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { status, notes, feedback } = await request.json()

    // 치료사 본인의 상담인지 확인
    const existingConsultation = await prisma.consultation.findFirst({
      where: {
        id: params.id,
        therapist: {
          userId: session.user.id
        }
      }
    })

    if (!existingConsultation) {
      return NextResponse.json(
        { error: '권한이 없거나 상담을 찾을 수 없습니다.' },
        { status: 403 }
      )
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(feedback !== undefined && { feedback })
      }
    })

    return NextResponse.json({
      message: '상담 정보가 수정되었습니다.',
      consultation: updatedConsultation
    })
  } catch (error) {
    console.error('상담 정보 수정 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}