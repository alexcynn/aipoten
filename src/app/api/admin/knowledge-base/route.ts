import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import type { DevelopmentCategory } from '@prisma/client';

/**
 * GET /api/admin/knowledge-base
 * 지식 베이스 목록 조회 (관리자 전용)
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    // 필터 조건 구성
    const where: any = {};

    if (category && category !== 'all') {
      where.category = category as DevelopmentCategory;
    }

    if (isActive !== null && isActive !== undefined && isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const knowledgeItems = await prisma.knowledgeBase.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        ageMin: true,
        ageMax: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: knowledgeItems,
      total: knowledgeItems.length,
    });
  } catch (error) {
    console.error('지식 베이스 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '지식 베이스 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/knowledge-base
 * 새 지식 항목 추가 (관리자 전용)
 */
export async function POST(request: NextRequest) {
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
    const { title, content, category, ageMin, ageMax, isActive } = body;

    // 유효성 검사
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: '제목, 내용, 카테고리는 필수입니다.' },
        { status: 400 }
      );
    }

    // 지식 항목 생성
    const knowledgeItem = await prisma.knowledgeBase.create({
      data: {
        title,
        content,
        category: category as DevelopmentCategory,
        ageMin: ageMin ? parseInt(ageMin) : null,
        ageMax: ageMax ? parseInt(ageMax) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: '지식 항목이 생성되었습니다.',
        data: knowledgeItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('지식 항목 생성 오류:', error);
    return NextResponse.json(
      { error: '지식 항목 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
