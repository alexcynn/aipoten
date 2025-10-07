import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('게시판 초기 데이터 생성 시작...')

  // 게시판 생성
  const boards = [
    {
      id: 'community',
      name: '육아소통',
      description: '부모님들과 육아 정보를 공유하는 커뮤니티 공간입니다.',
      order: 1,
      isActive: true,
    },
    {
      id: 'news',
      name: '소식',
      description: '아이포텐의 공지사항, 이벤트, 업데이트 소식을 확인하세요.',
      order: 2,
      isActive: true,
    },
    {
      id: 'notification',
      name: '알림장',
      description: '치료사와 부모 간 소통하는 알림장입니다.',
      order: 3,
      isActive: true,
    },
  ]

  for (const board of boards) {
    const existingBoard = await prisma.board.findUnique({
      where: { id: board.id },
    })

    if (existingBoard) {
      console.log(`게시판 "${board.name}" 이미 존재함 - 업데이트`)
      await prisma.board.update({
        where: { id: board.id },
        data: board,
      })
    } else {
      console.log(`게시판 "${board.name}" 생성`)
      await prisma.board.create({
        data: board,
      })
    }
  }

  console.log('✅ 게시판 초기 데이터 생성 완료')
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
