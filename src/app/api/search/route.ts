import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

// 놀이영성 활동 데이터 (실제로는 별도 데이터베이스에서 가져와야 함)
const spiritualityActivities = [
  {
    id: '1',
    title: '감사 일기 그리기',
    description: '오늘 하루 동안 감사했던 일들을 그림으로 표현해보는 활동입니다.',
    category: '감사하기',
    type: 'spirituality'
  },
  {
    id: '2',
    title: '나눔 상자 만들기',
    description: '가정에서 사용하지 않는 장난감이나 물건을 모아 다른 사람과 나누는 활동입니다.',
    category: '나눔과 배려',
    type: 'spirituality'
  },
  // ... 다른 활동들
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') // 'all', 'videos', 'posts', 'spirituality', 'children'

    if (!query) {
      return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 })
    }

    const results: Array<Record<string, unknown>> = []

    // 영상 검색
    if (!type || type === 'all' || type === 'videos') {
      const videos = await prisma.video.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { category: { contains: query } }
          ]
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })

      results.push(...videos.map(video => ({
        ...video,
        type: 'video',
        url: `/videos#${video.id}`
      })))
    }

    // 게시글 검색
    if (!type || type === 'all' || type === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } }
          ]
        },
        include: {
          board: true,
          author: {
            select: { name: true }
          }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })

      results.push(...posts.map(post => ({
        ...post,
        type: 'post',
        url: `/boards/${post.board.id}/posts/${post.id}`
      })))
    }

    // 아이 검색 (본인 아이만)
    if (!type || type === 'all' || type === 'children') {
      const children = await prisma.child.findMany({
        where: {
          AND: [
            { userId: session.user.id },
            { name: { contains: query } }
          ]
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })

      results.push(...children.map(child => ({
        ...child,
        type: 'child',
        url: `/children/${child.id}`
      })))
    }

    // 놀이영성 활동 검색
    if (!type || type === 'all' || type === 'spirituality') {
      const filteredActivities = spiritualityActivities.filter(activity =>
        activity.title.toLowerCase().includes(query.toLowerCase()) ||
        activity.description.toLowerCase().includes(query.toLowerCase()) ||
        activity.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)

      results.push(...filteredActivities.map(activity => ({
        ...activity,
        url: `/spirituality#${activity.id}`
      })))
    }

    // 뉴스 검색
    if (!type || type === 'all' || type === 'news') {
      const news = await prisma.news.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } }
          ]
        },
        take: 5,
        orderBy: { publishedAt: 'desc' }
      })

      results.push(...news.map(item => ({
        ...item,
        type: 'news',
        url: `/news/${item.id}`
      })))
    }

    // 결과를 타입별로 그룹화
    const groupedResults = {
      videos: results.filter(r => r.type === 'video'),
      posts: results.filter(r => r.type === 'post'),
      children: results.filter(r => r.type === 'child'),
      spirituality: results.filter(r => r.type === 'spirituality'),
      news: results.filter(r => r.type === 'news'),
      total: results.length
    }

    return NextResponse.json(groupedResults)

  } catch (error) {
    console.error('검색 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}