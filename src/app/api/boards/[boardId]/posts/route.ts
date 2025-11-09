import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 게시판 설정
const BOARD_CONFIG = {
  community: {
    name: '육아소통',
    canWrite: (role: string | undefined) => ['PARENT', 'THERAPIST', 'ADMIN'].includes(role || ''),
    canRead: () => true, // 전체 공개
  },
  notice: {
    name: '공지사항',
    canWrite: (role: string | undefined) => role === 'ADMIN',
    canRead: () => true, // 전체 공개
  },
  'parent-guide': {
    name: '부모 이용안내',
    canWrite: (role: string | undefined) => role === 'ADMIN',
    canRead: () => true, // 전체 공개
  },
  'therapist-guide': {
    name: '전문가 이용안내',
    canWrite: (role: string | undefined) => role === 'ADMIN',
    canRead: () => true, // 전체 공개
  },
  faq: {
    name: '자주하는 질문',
    canWrite: (role: string | undefined) => role === 'ADMIN',
    canRead: () => true, // 전체 공개
  },
}

// GET: 게시글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params
    const session = await getServerSession(authOptions)

    // 게시판 존재 여부 확인
    const config = BOARD_CONFIG[boardId as keyof typeof BOARD_CONFIG]
    if (!config) {
      return NextResponse.json(
        { error: '존재하지 않는 게시판입니다.' },
        { status: 404 }
      )
    }

    // 읽기 권한 확인
    if (!config.canRead(session?.user?.role)) {
      return NextResponse.json(
        { error: '이 게시판을 볼 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 쿼리 파라미터
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 게시글 조회
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { boardId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: [
          { isSticky: 'desc' }, // 고정 게시글 우선
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: { boardId },
      }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('게시글 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '게시글을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 게시글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 게시판 설정 확인
    const config = BOARD_CONFIG[boardId as keyof typeof BOARD_CONFIG]
    if (!config) {
      return NextResponse.json(
        { error: '존재하지 않는 게시판입니다.' },
        { status: 404 }
      )
    }

    // 쓰기 권한 확인
    if (!config.canWrite(session.user.role)) {
      return NextResponse.json(
        { error: '이 게시판에 글을 작성할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      content,
      summary,
      imageUrl,
      category,
      tags,
      isSticky,
      isPublished,
      publishedAt,
    } = body

    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      )
    }

    // 게시글 생성
    const post = await prisma.post.create({
      data: {
        title,
        content,
        summary,
        imageUrl,
        category,
        tags,
        isSticky: isSticky || false,
        isPublished: isPublished !== undefined ? isPublished : true,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        boardId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: '게시글이 작성되었습니다.',
      post,
    })
  } catch (error: any) {
    console.error('게시글 작성 오류:', error)
    return NextResponse.json(
      { error: '게시글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
