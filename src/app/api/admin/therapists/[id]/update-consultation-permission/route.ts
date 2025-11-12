import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - 언어 컨설팅 권한 변경
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { canDoConsultation, consultationFee, consultationSettlementAmount } = body

    if (typeof canDoConsultation !== 'boolean') {
      return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 })
    }

    // 권한 부여 시 필수 입력 검증
    if (canDoConsultation) {
      // 비용 필수 검증
      if (!consultationFee || consultationFee <= 0) {
        return NextResponse.json({ error: '언어컨설팅 비용을 입력해주세요.' }, { status: 400 })
      }

      // 정산금 필수 검증
      if (!consultationSettlementAmount || consultationSettlementAmount <= 0) {
        return NextResponse.json({ error: '언어컨설팅 정산금을 입력해주세요.' }, { status: 400 })
      }

      // 정산금 > 비용 검증
      if (consultationSettlementAmount > consultationFee) {
        return NextResponse.json({ error: '정산금이 컨설팅 비용보다 클 수 없습니다.' }, { status: 400 })
      }

      // 타입 검증
      if (typeof consultationFee !== 'number' || typeof consultationSettlementAmount !== 'number') {
        return NextResponse.json({ error: '비용과 정산금은 숫자여야 합니다.' }, { status: 400 })
      }
    }

    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { id },
    })

    if (!therapistProfile) {
      return NextResponse.json({ error: '치료사를 찾을 수 없습니다.' }, { status: 404 })
    }

    const updateData: any = {
      canDoConsultation,
    }

    // 권한을 부여하는 경우에만 비용/정산금 설정 (필수 검증 통과 후)
    if (canDoConsultation) {
      updateData.consultationFee = consultationFee
      updateData.consultationSettlementAmount = consultationSettlementAmount
    } else {
      // 권한 제거 시 비용/정산금은 null로 설정 (선택: 기존 값 유지 vs null)
      // 현재는 유지하도록 설정 (업데이트하지 않음)
    }

    const updated = await prisma.therapistProfile.update({
      where: { id },
      data: updateData,
    })

    // 플랫폼 수익 계산
    const platformProfit = updated.consultationFee && updated.consultationSettlementAmount
      ? updated.consultationFee - updated.consultationSettlementAmount
      : 0

    return NextResponse.json({
      therapistProfile: updated,
      platformProfit,
      message: canDoConsultation
        ? '언어 컨설팅 권한이 부여되었습니다.'
        : '언어 컨설팅 권한이 제거되었습니다.'
    })
  } catch (error) {
    console.error('❌ 언어 컨설팅 권한 변경 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
