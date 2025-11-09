import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('게시판 추가 시작...')

  const boards = [
    {
      id: 'community',
      name: '육아소통',
      description: '부모님들과 육아 정보를 공유하는 커뮤니티 공간입니다.',
      order: 1,
      isActive: true,
    },
    {
      id: 'notice',
      name: '공지사항',
      description: '아이포텐의 중요 공지사항을 확인하세요.',
      order: 2,
      isActive: true,
    },
    {
      id: 'parent-guide',
      name: '부모 이용안내',
      description: '부모님들을 위한 서비스 이용 가이드입니다.',
      order: 3,
      isActive: true,
    },
    {
      id: 'therapist-guide',
      name: '전문가 이용안내',
      description: '전문가 선생님들을 위한 서비스 이용 가이드입니다.',
      order: 4,
      isActive: true,
    },
    {
      id: 'faq',
      name: '자주하는 질문',
      description: '자주 묻는 질문과 답변을 확인하세요.',
      order: 5,
      isActive: true,
    },
  ]

  for (const board of boards) {
    const result = await prisma.board.upsert({
      where: { id: board.id },
      update: {
        name: board.name,
        description: board.description,
        order: board.order,
        isActive: board.isActive,
      },
      create: board,
    })
    console.log(`✓ ${result.name} 게시판 추가/업데이트 완료`)
  }

  console.log('게시판 추가 완료!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
