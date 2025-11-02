import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testRefund() {
  try {
    // 환불 가능한 PAID 결제 찾기
    const payment = await prisma.payment.findFirst({
      where: { status: 'PAID' },
      include: {
        parentUser: { select: { name: true } },
        child: { select: { name: true } }
      }
    })

    if (!payment) {
      console.log('❌ 환불 가능한 결제가 없습니다.')
      return
    }

    console.log('✅ 환불 테스트 대상 결제:')
    console.log(`   ID: ${payment.id}`)
    console.log(`   부모/아이: ${payment.parentUser.name}/${payment.child.name}`)
    console.log(`   결제 금액: ₩${payment.finalFee.toLocaleString()}`)
    console.log(`   상태: ${payment.status}`)

    // 환불 API 엔드포인트 확인
    console.log('\n📍 환불 API 엔드포인트:')
    console.log(`   POST /api/admin/payments/${payment.id}/refund`)
    console.log(`   Body: { refundAmount: 10000, refundReason: "테스트" }`)

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRefund()
