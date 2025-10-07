import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('News → Post 데이터 마이그레이션 시작...')

  try {
    // News 테이블이 존재하는지 확인
    const newsCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM news
    `.catch(() => {
      console.log('⚠️ News 테이블이 존재하지 않습니다. 스키마가 이미 업데이트되었을 수 있습니다.')
      return [{ count: 0 }]
    })

    const count = Array.isArray(newsCount) ? Number(newsCount[0].count) : 0

    if (count === 0) {
      console.log('마이그레이션할 News 데이터가 없습니다.')
    } else {
      console.log(`${count}개의 News 항목을 Post로 마이그레이션합니다...`)

      // News 데이터를 Post로 이동
      await prisma.$executeRaw`
        INSERT INTO posts (
          id, title, content, summary, imageUrl, category, tags,
          views, isSticky, isPublished, publishedAt, boardId, authorId,
          createdAt, updatedAt
        )
        SELECT
          id,
          title,
          content,
          summary,
          imageUrl,
          category,
          tags,
          views,
          isFeatured,
          isPublished,
          publishedAt,
          'news' as boardId,
          COALESCE(authorId, 'system') as authorId,
          createdAt,
          updatedAt
        FROM news
        WHERE id NOT IN (SELECT id FROM posts)
      `

      console.log('✅ News → Post 마이그레이션 완료')
    }

    // parenting 게시판 ID를 community로 변경
    const parentingUpdate = await prisma.$executeRaw`
      UPDATE posts
      SET boardId = 'community'
      WHERE boardId = 'parenting'
    `
    console.log(`✅ ${parentingUpdate}개의 parenting 게시글을 community로 변경`)

    // notification 게시판 ID 통일 (announcement → notification)
    const notificationUpdate = await prisma.$executeRaw`
      UPDATE posts
      SET boardId = 'notification'
      WHERE boardId = 'announcement'
    `
    console.log(`✅ ${notificationUpdate}개의 게시글을 notification으로 변경`)

    console.log('\n🎉 모든 데이터 마이그레이션이 완료되었습니다!')
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
