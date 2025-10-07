import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: 게시글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { boardId: string; postId: string } }
) {
  try {
    const { boardId, postId } = params

    // 게시글 조회 및 조회수 증가
    const post = await prisma.post.update({
      where: { id: postId, boardId },
      data: {
        views: {
          increment: 1,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error: any) {
    console.error('게시글 조회 오류:', error)
    return NextResponse.json(
      { error: '게시글을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 게시글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { boardId: string; postId: string } }
) {
  try {
    const { boardId, postId } = params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 기존 게시글 조회
    const existingPost = await prisma.post.findUnique({
      where: { id: postId, boardId },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인 (작성자 또는 관리자만 수정 가능)
    if (
      existingPost.authorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: '게시글을 수정할 권한이 없습니다.' },
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

    // 게시글 수정
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        summary,
        imageUrl,
        category,
        tags,
        isSticky,
        isPublished,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
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
      message: '게시글이 수정되었습니다.',
      post: updatedPost,
    })
  } catch (error: any) {
    console.error('게시글 수정 오류:', error)
    return NextResponse.json(
      { error: '게시글 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 게시글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { boardId: string; postId: string } }
) {
  try {
    const { boardId, postId } = params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 기존 게시글 조회
    const existingPost = await prisma.post.findUnique({
      where: { id: postId, boardId },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인 (작성자 또는 관리자만 삭제 가능)
    if (
      existingPost.authorId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: '게시글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 게시글 삭제 (댓글도 CASCADE로 자동 삭제됨)
    await prisma.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({
      message: '게시글이 삭제되었습니다.',
    })
  } catch (error: any) {
    console.error('게시글 삭제 오류:', error)
    return NextResponse.json(
      { error: '게시글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
