import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { generateStructuredAssessmentAnalysis, StructuredAnalysisResponse } from '@/lib/services/vertexAIService';
import { generateRAGContext } from '@/lib/services/ragService';

/**
 * POST /api/assessments/[id]/analyze
 * 발달체크 결과에 대한 AI 분석 생성
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 발달체크 조회 (권한 확인 포함)
    const assessment = await prisma.developmentAssessment.findUnique({
      where: { id },
      include: {
        child: true,
        results: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: '발달체크를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인: 자신의 아이 또는 관리자만 가능
    if (
      assessment.child.userId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 발달체크가 완료되지 않은 경우
    if (assessment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: '완료된 발달체크만 분석할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 이미 분석이 완료된 경우 기존 분석 반환
    if (assessment.aiAnalysis) {
      // 구조화된 데이터도 함께 반환
      return NextResponse.json({
        success: true,
        message: '이미 분석이 완료된 발달체크입니다.',
        data: {
          id: assessment.id,
          aiAnalysis: assessment.aiAnalysis,
          aiAnalysisSummary: assessment.aiAnalysisSummary,
          aiRecommendations: assessment.aiRecommendations ? JSON.parse(assessment.aiRecommendations) : [],
          aiCategoryAnalysis: assessment.aiCategoryAnalysis ? JSON.parse(assessment.aiCategoryAnalysis) : {},
          aiAnalyzedAt: assessment.aiAnalyzedAt,
        },
      });
    }

    // 커스텀 프롬프트 받기 (선택사항)
    const body = await request.json().catch(() => ({}));
    const customPrompt = body.customPrompt;

    let structuredAnalysis: StructuredAnalysisResponse;

    if (customPrompt) {
      // 커스텀 프롬프트 사용 (레거시 지원)
      const { generateText } = await import('@/lib/services/vertexAIService');
      const aiAnalysis = await generateText(customPrompt, {
        temperature: 0.7,
        maxOutputTokens: 10000,
      });

      // 커스텀 프롬프트는 구조화되지 않은 응답이므로 기본 구조로 래핑
      structuredAnalysis = {
        summary: '발달체크 분석이 완료되었습니다.',
        overallAnalysis: aiAnalysis,
        recommendations: [],
        categoryAnalysis: {},
      };
    } else {
      // 기본 프롬프트 사용 - 구조화된 분석 생성
      // 1. RAG 컨텍스트 생성
      const ragContext = await generateRAGContext({
        ageInMonths: assessment.ageInMonths,
        results: assessment.results.map((r) => ({
          category: r.category,
          score: r.score,
          level: r.level,
        })),
        concernsText: assessment.concernsText || undefined,
      });

      // 2. 구조화된 LLM 분석 생성
      structuredAnalysis = await generateStructuredAssessmentAnalysis(
        {
          ageInMonths: assessment.ageInMonths,
          results: assessment.results.map((r) => ({
            category: r.category,
            score: r.score,
            level: r.level,
          })),
          concernsText: assessment.concernsText || undefined,
        },
        ragContext
      );
    }

    // 3. 분석 결과 저장 (DevelopmentAssessment)
    const updatedAssessment = await prisma.developmentAssessment.update({
      where: { id },
      data: {
        aiAnalysis: structuredAnalysis.overallAnalysis,
        aiAnalysisSummary: structuredAnalysis.summary,
        aiRecommendations: JSON.stringify(structuredAnalysis.recommendations),
        aiCategoryAnalysis: JSON.stringify(structuredAnalysis.categoryAnalysis),
        aiAnalyzedAt: new Date(),
      },
      include: {
        results: true,
      },
    });

    // 4. 각 AssessmentResult에 itemFeedbacks 저장
    if (structuredAnalysis.categoryAnalysis) {
      for (const result of updatedAssessment.results) {
        const categoryData = structuredAnalysis.categoryAnalysis[result.category];
        if (categoryData && categoryData.itemFeedbacks) {
          await prisma.assessmentResult.update({
            where: { id: result.id },
            data: {
              itemFeedbacks: JSON.stringify(categoryData.itemFeedbacks),
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'AI 분석이 완료되었습니다.',
      data: {
        id: updatedAssessment.id,
        aiAnalysis: updatedAssessment.aiAnalysis,
        aiAnalysisSummary: updatedAssessment.aiAnalysisSummary,
        aiRecommendations: structuredAnalysis.recommendations,
        aiCategoryAnalysis: structuredAnalysis.categoryAnalysis,
        aiAnalyzedAt: updatedAssessment.aiAnalyzedAt,
      },
    });
  } catch (error) {
    console.error('AI 분석 생성 오류:', error);

    // Vertex AI 설정 오류 처리
    if (
      error instanceof Error &&
      error.message.includes('Google Cloud Project ID')
    ) {
      return NextResponse.json(
        {
          error:
            'AI 분석 기능이 설정되지 않았습니다. 관리자에게 문의하세요.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: `AI 분석 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      },
      { status: 500 }
    );
  }
}
