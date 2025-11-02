import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPayments() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        parentUser: { select: { name: true } },
        child: { select: { name: true } },
        therapist: { select: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log('📊 최근 결제 내역:')
    payments.forEach((p, i) => {
      console.log(`${i+1}. [${p.status}] ${p.parentUser.name}/${p.child.name} - ₩${p.finalFee.toLocaleString()}`)
      if (p.refundAmount) console.log(`   환불액: ₩${p.refundAmount.toLocaleString()}`)
      if (p.paidAt) console.log(`   결제일: ${p.paidAt}`)
    })

    const statusCount = await prisma.payment.groupBy({
      by: ['status'],
      _count: true
    })

    console.log('\n📈 상태별 개수:')
    statusCount.forEach(s => {
      console.log(`   ${s.status}: ${s._count}개`)
    })

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPayments()
