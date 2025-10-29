/**
 * RAG (Retrieval-Augmented Generation) 서비스
 * 지식 베이스에서 관련 정보를 검색하여 LLM에 컨텍스트로 제공합니다.
 */

import { prisma } from '@/lib/prisma';
import { generateEmbedding, cosineSimilarity } from './embeddingService';
import type { DevelopmentCategory } from '@prisma/client';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: DevelopmentCategory | null;
  ageMin: number | null;
  ageMax: number | null;
  relevanceScore?: number;
}

/**
 * 발달체크 결과 기반 관련 지식 검색
 */
export async function searchRelevantKnowledge(params: {
  query: string;
  ageInMonths?: number;
  categories?: DevelopmentCategory[];
  limit?: number;
}): Promise<KnowledgeItem[]> {
  const { query, ageInMonths, categories, limit = 5 } = params;

  try {
    // 1. 기본 필터 조건 구성
    const where: any = {
      isActive: true,
    };

    // 월령 필터 (월령이 제공된 경우)
    if (ageInMonths !== undefined) {
      where.OR = [
        {
          AND: [
            { ageMin: { lte: ageInMonths } },
            { ageMax: { gte: ageInMonths } },
          ],
        },
        {
          AND: [{ ageMin: null }, { ageMax: null }],
        },
      ];
    }

    // 카테고리 필터
    if (categories && categories.length > 0) {
      where.category = { in: categories };
    }

    // 2. 지식 베이스에서 후보 항목 조회
    const knowledgeItems = await prisma.knowledgeBase.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        ageMin: true,
        ageMax: true,
        embedding: true,
      },
    });

    if (knowledgeItems.length === 0) {
      return [];
    }

    // 3. 임베딩 기반 유사도 검색
    try {
      const queryEmbedding = await generateEmbedding(query);

      const itemsWithScores = knowledgeItems.map((item) => {
        let relevanceScore = 0;

        if (item.embedding) {
          try {
            const itemEmbedding = JSON.parse(item.embedding) as number[];
            relevanceScore = cosineSimilarity(queryEmbedding, itemEmbedding);
          } catch (e) {
            // 임베딩 파싱 실패 시 키워드 매칭으로 대체
            relevanceScore = calculateKeywordScore(query, item.content);
          }
        } else {
          // 임베딩이 없는 경우 키워드 매칭 사용
          relevanceScore = calculateKeywordScore(query, item.content);
        }

        return {
          ...item,
          relevanceScore,
        };
      });

      // 4. 유사도 순으로 정렬하고 상위 N개 반환
      return itemsWithScores
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, limit);
    } catch (embeddingError) {
      console.warn('임베딩 기반 검색 실패, 키워드 검색으로 대체:', embeddingError);

      // 임베딩 실패 시 키워드 기반 검색
      const itemsWithScores = knowledgeItems.map((item) => ({
        ...item,
        relevanceScore: calculateKeywordScore(query, item.content),
      }));

      return itemsWithScores
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, limit);
    }
  } catch (error) {
    console.error('지식 베이스 검색 오류:', error);
    return [];
  }
}

/**
 * 키워드 기반 유사도 점수 계산 (대체 방법)
 */
function calculateKeywordScore(query: string, content: string): number {
  const queryWords = query
    .toLowerCase()
    .match(/\w+/g) || [];
  const contentLower = content.toLowerCase();

  let score = 0;
  queryWords.forEach((word) => {
    if (contentLower.includes(word)) {
      score += 1;
    }
  });

  return score / Math.max(queryWords.length, 1);
}

/**
 * 발달체크 결과를 기반으로 RAG 컨텍스트 생성
 */
export async function generateRAGContext(params: {
  ageInMonths: number;
  results: Array<{
    category: DevelopmentCategory;
    score: number;
    level: string;
  }>;
  concernsText?: string;
}): Promise<string> {
  const { ageInMonths, results, concernsText } = params;

  // 주의가 필요한 영역 추출
  const concernedCategories = results
    .filter(
      (r) => r.level === 'NEEDS_TRACKING' || r.level === 'NEEDS_ASSESSMENT'
    )
    .map((r) => r.category);

  // 모든 카테고리 포함 (우선순위: 주의 영역 > 일반 영역)
  const allCategories = [
    ...concernedCategories,
    ...results.map((r) => r.category).filter((c) => !concernedCategories.includes(c)),
  ];

  // 검색 쿼리 구성
  const queryParts: string[] = [];

  // 월령 정보 추가
  queryParts.push(`${ageInMonths}개월`);

  // 주의 영역 추가
  if (concernedCategories.length > 0) {
    const categoryNames: Record<string, string> = {
      GROSS_MOTOR: '대근육',
      FINE_MOTOR: '소근육',
      LANGUAGE: '언어',
      COGNITIVE: '인지',
      SOCIAL: '사회성',
    };

    concernedCategories.forEach((cat) => {
      queryParts.push(categoryNames[cat] || cat);
    });
  }

  // 부모의 우려 사항 추가
  if (concernsText) {
    queryParts.push(concernsText);
  }

  const query = queryParts.join(' ');

  // 관련 지식 검색
  const knowledgeItems = await searchRelevantKnowledge({
    query,
    ageInMonths,
    categories: allCategories.slice(0, 3), // 상위 3개 카테고리만
    limit: 5,
  });

  if (knowledgeItems.length === 0) {
    return '관련 전문 지식을 찾을 수 없습니다.';
  }

  // 컨텍스트 포맷팅
  const contextParts = knowledgeItems.map((item, index) => {
    return `### 참고 자료 ${index + 1}: ${item.title}
${item.content}
`;
  });

  return contextParts.join('\n\n');
}

/**
 * 지식 항목에 임베딩 생성 및 저장
 */
export async function generateAndSaveEmbedding(
  knowledgeId: string
): Promise<void> {
  try {
    const knowledge = await prisma.knowledgeBase.findUnique({
      where: { id: knowledgeId },
      select: { title: true, content: true },
    });

    if (!knowledge) {
      throw new Error('지식 항목을 찾을 수 없습니다.');
    }

    // 제목과 내용을 결합하여 임베딩 생성
    const text = `${knowledge.title}\n${knowledge.content}`;
    const embedding = await generateEmbedding(text);

    // 임베딩을 JSON 문자열로 저장
    await prisma.knowledgeBase.update({
      where: { id: knowledgeId },
      data: { embedding: JSON.stringify(embedding) },
    });
  } catch (error) {
    console.error('임베딩 생성 및 저장 오류:', error);
    throw error;
  }
}
