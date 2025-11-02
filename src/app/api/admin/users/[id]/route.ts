import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true,
            gestationalWeeks: true,
            birthWeight: true,
            currentHeight: true,
            currentWeight: true,
            medicalHistory: true,
            createdAt: true
          }
        },
        bookings: {
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            sessionNumber: true,
            child: {
              select: {
                name: true
              }
            },
            therapist: {
              select: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            },
            payment: {
              select: {
                sessionType: true,
                finalFee: true,
                totalSessions: true
              }
            }
          },
          orderBy: {
            scheduledAt: 'desc'
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      addressDetail: user.addressDetail,
      createdAt: user.createdAt.toISOString(),
      children: user.children.map(child => ({
        ...child,
        birthDate: child.birthDate.toISOString(),
        createdAt: child.createdAt.toISOString()
      })),
      consultations: user.bookings
        .filter(b => b.payment.sessionType === 'CONSULTATION')
        .map(booking => ({
          id: booking.id,
          scheduledAt: booking.scheduledAt.toISOString(),
          status: booking.status,
          childName: booking.child.name,
          therapistName: booking.therapist.user.name,
          fee: booking.payment.finalFee,
          sessionNumber: booking.sessionNumber,
          totalSessions: booking.payment.totalSessions
        })),
      therapies: user.bookings
        .filter(b => b.payment.sessionType === 'THERAPY')
        .map(booking => ({
          id: booking.id,
          scheduledAt: booking.scheduledAt.toISOString(),
          status: booking.status,
          childName: booking.child.name,
          therapistName: booking.therapist.user.name,
          fee: booking.payment.finalFee,
          sessionNumber: booking.sessionNumber,
          totalSessions: booking.payment.totalSessions
        }))
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('사용자 상세 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { role } = await request.json()

    if (!role || !['PARENT', 'THERAPIST', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: '유효한 역할이 필요합니다.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role }
    })

    return NextResponse.json({
      message: '사용자 역할이 업데이트되었습니다.',
      user: updatedUser
    })
  } catch (error) {
    console.error('사용자 역할 업데이트 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 계정은 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: '사용자가 삭제되었습니다.'
    })
  } catch (error) {
    console.error('사용자 삭제 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}