import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n=== 최근 문의 목록 (상세) ===')
  const inquiries = await prisma.inquiry.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      }
    }
  })

  inquiries.forEach((inquiry) => {
    console.log(`\n==================`)
    console.log(`문의 ID: ${inquiry.id}`)
    console.log(`제목: ${inquiry.title}`)
    console.log(`문의 userId 필드: ${inquiry.userId}`)
    console.log(`사용자 정보:`)
    console.log(`  - User ID: ${inquiry.user.id}`)
    console.log(`  - 이름: ${inquiry.user.name}`)
    console.log(`  - 이메일: ${inquiry.user.email}`)
    console.log(`  - 역할: ${inquiry.user.role}`)
    console.log(`상태: ${inquiry.status}`)
    console.log(`기존 응답: ${inquiry.response ? '있음' : '없음'}`)
  })

  console.log('\n=== 최근 메시지 목록 ===')
  const messages = await prisma.inquiryMessage.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      inquiry: {
        select: {
          title: true,
        }
      }
    }
  })

  messages.forEach((msg) => {
    console.log(`\n문의: ${msg.inquiry.title}`)
    console.log(`발신자: ${msg.senderType}`)
    console.log(`내용: ${msg.content.substring(0, 50)}...`)
    console.log(`시간: ${msg.createdAt}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
