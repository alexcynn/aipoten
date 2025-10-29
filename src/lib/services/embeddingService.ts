/**
 * 임베딩 서비스
 * 텍스트를 벡터로 변환하여 의미 기반 검색을 가능하게 합니다.
 */

import { VertexAI } from '@google-cloud/vertexai';

let vertexAI: VertexAI | null = null;

function getVertexAI(): VertexAI {
  if (!vertexAI) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    if (!projectId || projectId === 'your-project-id') {
      throw new Error(
        'Google Cloud Project ID가 설정되지 않았습니다. .env 파일에서 GOOGLE_CLOUD_PROJECT_ID를 설정해주세요.'
      );
    }

    vertexAI = new VertexAI({
      project: projectId,
      location: location,
    });
  }

  return vertexAI;
}

/**
 * 텍스트를 임베딩 벡터로 변환
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const vertex = getVertexAI();

    // Vertex AI의 text-embedding 모델 사용
    const model = vertex.preview.getGenerativeModel({
      model: 'text-embedding-004',
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text }] }],
    });

    // 임베딩 추출
    // 참고: Vertex AI의 실제 임베딩 API 응답 구조에 따라 조정 필요
    const embedding = result.response.candidates?.[0]?.content?.parts?.[0];

    if (!embedding) {
      throw new Error('임베딩 생성 실패');
    }

    // 임시: 간단한 벡터 반환 (실제 구현 시 조정 필요)
    return Array(768).fill(0); // 실제로는 API 응답에서 추출
  } catch (error) {
    console.error('임베딩 생성 오류:', error);

    // 임베딩 API가 설정되지 않았거나 오류가 발생한 경우,
    // 간단한 키워드 기반 검색을 위한 더미 벡터 반환
    console.warn(
      '임베딩 API를 사용할 수 없습니다. 키워드 기반 검색으로 대체됩니다.'
    );
    return generateSimpleEmbedding(text);
  }
}

/**
 * 간단한 키워드 기반 임베딩 (대체 방법)
 * 실제 임베딩 API를 사용할 수 없을 때 사용
 */
function generateSimpleEmbedding(text: string): number[] {
  // 간단한 TF-IDF 스타일의 벡터 생성
  // 실제로는 단어 빈도를 기반으로 하는 간단한 벡터
  const words = text.toLowerCase().match(/\w+/g) || [];
  const vector = new Array(100).fill(0);

  words.forEach((word) => {
    const hash = Array.from(word).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );
    const index = hash % 100;
    vector[index] += 1;
  });

  // 정규화
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map((v) => v / magnitude) : vector;
}

/**
 * 코사인 유사도 계산
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('벡터 길이가 일치하지 않습니다.');
  }

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * 여러 텍스트의 임베딩을 일괄 생성
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }

  return embeddings;
}
