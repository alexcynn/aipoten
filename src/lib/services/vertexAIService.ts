/**
 * Google Vertex AI (Gemini) 서비스
 * Gemini 1.5 Flash를 사용하여 텍스트 생성 및 분석을 수행합니다.
 */

import { VertexAI } from '@google-cloud/vertexai';

// Vertex AI 클라이언트 초기화
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
 * Gemini 모델로 텍스트 생성
 */
export async function generateText(
  prompt: string,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  }
): Promise<string> {
  try {
    const vertex = getVertexAI();
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    const generativeModel = vertex.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxOutputTokens ?? 2048,
        topP: options?.topP ?? 0.95,
        topK: options?.topK ?? 40,
      },
    });

    const result = await generativeModel.generateContent(prompt);
    const response = result.response;

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('Gemini API로부터 응답을 받지 못했습니다.');
    }

    const text = response.candidates[0].content.parts[0].text;

    if (!text) {
      throw new Error('생성된 텍스트가 비어있습니다.');
    }

    return text;
  } catch (error) {
    console.error('Gemini 텍스트 생성 오류:', error);
    throw new Error(
      `텍스트 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}

/**
 * 발달체크 결과 분석용 프롬프트 생성
 */
export function createAssessmentAnalysisPrompt(
  assessmentData: {
    ageInMonths: number;
    results: Array<{
      category: string;
      score: number;
      level: string;
    }>;
    concernsText?: string;
  },
  ragContext: string
): string {
  const categoryNames: Record<string, string> = {
    GROSS_MOTOR: '대근육 운동',
    FINE_MOTOR: '소근육 운동',
    LANGUAGE: '언어',
    COGNITIVE: '인지',
    SOCIAL: '사회성',
  };

  const levelNames: Record<string, string> = {
    ADVANCED: '또래보다 빠른 수준',
    NORMAL: '또래 수준',
    NEEDS_TRACKING: '추적검사 권장',
    NEEDS_ASSESSMENT: '심화평가 권장',
  };

  const resultsText = assessmentData.results
    .map((r) => {
      const category = categoryNames[r.category] || r.category;
      const level = levelNames[r.level] || r.level;
      return `- ${category}: ${r.score}점 (${level})`;
    })
    .join('\n');

  return `당신은 아동 발달 전문가입니다. 다음 발달체크 결과를 바탕으로 종합 분석을 제공해주세요.

## 아이 정보
- 월령: ${assessmentData.ageInMonths}개월

## 발달체크 결과
${resultsText}

${assessmentData.concernsText ? `## 부모님의 우려 사항\n${assessmentData.concernsText}\n` : ''}

## 참고할 전문 지식
${ragContext}

## 요청사항
위 정보를 바탕으로 다음 내용을 포함한 종합 분석을 작성해주세요:

1. **전반적인 발달 상태 요약** (2-3문장)
2. **영역별 상세 분석**
   - 각 발달 영역(대근육, 소근육, 언어, 인지, 사회성)에 대한 평가
   - 강점 영역과 주의가 필요한 영역 구분
3. **맞춤 육아 팁 및 활동 추천** (3-5가지)
   - 월령에 맞는 구체적인 놀이 및 활동
   - 일상생활에서 실천 가능한 팁
4. **전문가 상담 필요성**
   - 전문가 상담이 필요한지 여부
   - 필요하다면 어떤 분야의 치료사와 상담이 도움이 될지

응답은 마크다운 형식으로 작성하되, 부모님이 읽기 쉽고 따뜻한 톤으로 작성해주세요.`;
}

/**
 * 발달체크 종합 분석 생성
 */
export async function generateAssessmentAnalysis(
  assessmentData: {
    ageInMonths: number;
    results: Array<{
      category: string;
      score: number;
      level: string;
    }>;
    concernsText?: string;
  },
  ragContext: string
): Promise<string> {
  const prompt = createAssessmentAnalysisPrompt(assessmentData, ragContext);

  return await generateText(prompt, {
    temperature: 0.7,
    maxOutputTokens: 3000,
  });
}
