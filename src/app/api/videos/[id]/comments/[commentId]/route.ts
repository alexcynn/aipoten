import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 댓글 삭제
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { commentId } = await context.params

    // 댓글 조회
    const comment = await prisma.videoComment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 작성자 또는 관리자만 삭제 가능
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (comment.userId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '댓글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    await prisma.videoComment.delete({
      where: { id: commentId }
    })

    return NextResponse.json({
      message: '댓글이 삭제되었습니다.'
    })
  } catch (error) {
    console.error('댓글 삭제 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
