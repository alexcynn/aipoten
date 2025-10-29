import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { generateAndSaveEmbedding } from '@/lib/services/ragService';

/**
 * GET /api/admin/knowledge-base/[id]
 * 지식 항목 상세 조회 (관리자 전용)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const knowledgeItem = await prisma.knowledgeBase.findUnique({
      where: { id: params.id },
    });

    if (!knowledgeItem) {
      return NextResponse.json(
        { error: '지식 항목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: knowledgeItem,
    });
  } catch (error) {
    console.error('지식 항목 조회 오류:', error);
    return NextResponse.json(
      { error: '지식 항목을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/knowledge-base/[id]
 * 지식 항목 수정 (관리자 전용)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category, ageMin, ageMax, tags, isActive } = body;

    // 기존 항목 존재 확인
    const existingItem = await prisma.knowledgeBase.findUnique({
      where: { id: params.id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: '지식 항목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 업데이트 데이터 구성
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category || null;
    if (ageMin !== undefined)
      updateData.ageMin = ageMin ? parseInt(ageMin) : null;
    if (ageMax !== undefined)
      updateData.ageMax = ageMax ? parseInt(ageMax) : null;
    if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // 지식 항목 업데이트
    const updatedItem = await prisma.knowledgeBase.update({
      where: { id: params.id },
      data: updateData,
    });

    // 제목이나 내용이 변경된 경우 임베딩 재생성
    if (title !== undefined || content !== undefined) {
      generateAndSaveEmbedding(params.id).catch((error) => {
        console.error('임베딩 재생성 실패:', error);
      });
    }

    return NextResponse.json({
      success: true,
      message: '지식 항목이 수정되었습니다.',
      data: updatedItem,
    });
  } catch (error) {
    console.error('지식 항목 수정 오류:', error);
    return NextResponse.json(
      { error: '지식 항목 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/knowledge-base/[id]
 * 지식 항목 삭제 (관리자 전용)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // 기존 항목 존재 확인
    const existingItem = await prisma.knowledgeBase.findUnique({
      where: { id: params.id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: '지식 항목을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 지식 항목 삭제
    await prisma.knowledgeBase.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: '지식 항목이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('지식 항목 삭제 오류:', error);
    return NextResponse.json(
      { error: '지식 항목 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
