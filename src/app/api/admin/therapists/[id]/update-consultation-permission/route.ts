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

    // 비용 검증
    if (consultationFee !== undefined && consultationFee !== null) {
      if (typeof consultationFee !== 'number' || consultationFee < 0) {
        return NextResponse.json({ error: '유효하지 않은 컨설팅 비용입니다.' }, { status: 400 })
      }
    }

    if (consultationSettlementAmount !== undefined && consultationSettlementAmount !== null) {
      if (typeof consultationSettlementAmount !== 'number' || consultationSettlementAmount < 0) {
        return NextResponse.json({ error: '유효하지 않은 정산금입니다.' }, { status: 400 })
      }
    }

    // 정산금이 비용보다 클 수 없음
    const finalFee = consultationFee !== undefined ? consultationFee : null
    const finalSettlement = consultationSettlementAmount !== undefined ? consultationSettlementAmount : null

    if (finalFee !== null && finalSettlement !== null && finalSettlement > finalFee) {
      return NextResponse.json({ error: '정산금이 컨설팅 비용보다 클 수 없습니다.' }, { status: 400 })
    }

    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { id },
    })

    if (!therapistProfile) {
      return NextResponse.json({ error: '치료사를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 시스템 기본값 조회 (미입력 시 사용)
    const systemSettings = await prisma.systemSettings.findUnique({
      where: { id: 'system' },
    })

    const updateData: any = {
      canDoConsultation,
    }

    // 권한을 부여하는 경우에만 비용/정산금 설정
    if (canDoConsultation) {
      // 비용이 제공된 경우 사용, 아니면 기존 값 유지 또는 시스템 기본값
      if (consultationFee !== undefined) {
        updateData.consultationFee = consultationFee
      } else if (!therapistProfile.consultationFee && systemSettings?.consultationDefaultFee) {
        updateData.consultationFee = systemSettings.consultationDefaultFee
      }

      // 정산금이 제공된 경우 사용, 아니면 기존 값 유지 또는 시스템 기본값
      if (consultationSettlementAmount !== undefined) {
        updateData.consultationSettlementAmount = consultationSettlementAmount
      } else if (!therapistProfile.consultationSettlementAmount && systemSettings?.consultationDefaultSettlement) {
        updateData.consultationSettlementAmount = systemSettings.consultationDefaultSettlement
      }
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
