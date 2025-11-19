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
    maxOutputTokens: 10000, // 3000 → 10000으로 증가 (약 3배 이상)
  });
}

/**
 * 구조화된 발달체크 분석 응답 타입
 */
export interface StructuredAnalysisResponse {
  summary: string;  // 70자 이내 요약 (대시보드용)
  overallAnalysis: string;  // 전체 종합 분석
  recommendations: string[];  // 맞춤 권장사항 목록
  categoryAnalysis: {
    [category: string]: {
      level: string;
      analysis: string;
      itemFeedbacks: Array<{
        question: string;
        feedback: string;
        icon: 'check' | 'warning';  // 잘함/주의 필요
      }>;
    };
  };
}

/**
 * 구조화된 발달체크 분석 프롬프트 생성 (JSON 응답)
 */
export function createStructuredAssessmentPrompt(
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
    ADVANCED: '빠른수준',
    NORMAL: '또래수준',
    NEEDS_TRACKING: '추적검사요망',
    NEEDS_ASSESSMENT: '심화평가권고',
  };

  const resultsText = assessmentData.results
    .map((r) => {
      const category = categoryNames[r.category] || r.category;
      const level = levelNames[r.level] || r.level;
      return `- ${category}: ${r.score}점 (${level})`;
    })
    .join('\n');

  return `당신은 아동 발달 전문가입니다. 다음 발달체크 결과를 분석하여 반드시 JSON 형식으로만 응답해주세요.

## 아이 정보
- 월령: ${assessmentData.ageInMonths}개월

## 발달체크 결과
${resultsText}

${assessmentData.concernsText ? `## 부모님의 우려 사항\n${assessmentData.concernsText}\n` : ''}

## 참고할 전문 지식
${ragContext}

## 응답 형식
반드시 아래 JSON 구조로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

{
  "summary": "70자 이내의 한 줄 요약. 예: 전반적으로 건강하게 발달하고 있으나 언어 분야는 추적이 필요합니다.",
  "overallAnalysis": "아이의 전반적인 발달 상태에 대한 종합 분석 (2-3문단). 강점, 주의점, 향후 발달 전망을 포함하세요.",
  "recommendations": [
    "구체적인 권장사항 1 (예: 매일 15분씩 그림책을 함께 읽으며 대화 나누기)",
    "구체적인 권장사항 2",
    "구체적인 권장사항 3",
    "구체적인 권장사항 4",
    "구체적인 권장사항 5"
  ],
  "categoryAnalysis": {
    "GROSS_MOTOR": {
      "level": "ADVANCED",
      "analysis": "해당 영역에 대한 상세 분석",
      "itemFeedbacks": [
        {
          "question": "계단 오르내리기",
          "feedback": "훌륭해요! 난간을 잡고 안정적으로 계단을 오르내릴 수 있네요. 이제 한발씩 번갈아가며 계단을 오를 수 있도록 연습해보아요.",
          "icon": "check"
        },
        {
          "question": "공차기",
          "feedback": "정말 잘하고 있어요! 균형감각이 뛰어나고 다리 힘이 튼튼해요.",
          "icon": "check"
        },
        {
          "question": "한발 서기",
          "feedback": "아직은 어려워하지만 괜찮아요! 벽을 잡고 한발 들기 시작해서 천천히 연습해보세요.",
          "icon": "warning"
        }
      ]
    },
    "FINE_MOTOR": {
      "level": "NORMAL",
      "analysis": "해당 영역에 대한 상세 분석",
      "itemFeedbacks": [...]
    },
    "LANGUAGE": {
      "level": "NEEDS_TRACKING",
      "analysis": "해당 영역에 대한 상세 분석",
      "itemFeedbacks": [...]
    },
    "COGNITIVE": {
      "level": "NORMAL",
      "analysis": "해당 영역에 대한 상세 분석",
      "itemFeedbacks": [...]
    },
    "SOCIAL": {
      "level": "NEEDS_ASSESSMENT",
      "analysis": "해당 영역에 대한 상세 분석",
      "itemFeedbacks": [...]
    }
  }
}

## 작성 지침
1. summary는 반드시 70자 이내로 작성
2. 각 영역별로 3개의 itemFeedbacks를 작성 (월령에 맞는 발달 과제 기반)
3. icon은 잘하면 "check", 연습이 필요하면 "warning"
4. recommendations는 구체적이고 실천 가능한 내용 5개
5. 부모님이 이해하기 쉽고 따뜻한 톤으로 작성
6. 반드시 유효한 JSON만 출력하세요 (마크다운 코드블록 없이)`;
}

/**
 * 구조화된 발달체크 분석 생성
 */
export async function generateStructuredAssessmentAnalysis(
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
): Promise<StructuredAnalysisResponse> {
  const prompt = createStructuredAssessmentPrompt(assessmentData, ragContext);

  const response = await generateText(prompt, {
    temperature: 0.7,
    maxOutputTokens: 10000,
  });

  // JSON 파싱 (마크다운 코드블록이 있을 수 있으므로 제거)
  let jsonString = response.trim();

  // ```json 또는 ``` 제거
  if (jsonString.startsWith('```json')) {
    jsonString = jsonString.slice(7);
  } else if (jsonString.startsWith('```')) {
    jsonString = jsonString.slice(3);
  }
  if (jsonString.endsWith('```')) {
    jsonString = jsonString.slice(0, -3);
  }
  jsonString = jsonString.trim();

  try {
    const parsed = JSON.parse(jsonString) as StructuredAnalysisResponse;

    // 기본값 설정 (파싱 실패 방지)
    if (!parsed.summary) parsed.summary = '';
    if (!parsed.overallAnalysis) parsed.overallAnalysis = '';
    if (!parsed.recommendations) parsed.recommendations = [];
    if (!parsed.categoryAnalysis) parsed.categoryAnalysis = {};

    return parsed;
  } catch (parseError) {
    console.error('JSON 파싱 오류:', parseError);
    console.error('원본 응답:', response);

    // 파싱 실패 시 기본 구조 반환
    return {
      summary: '발달체크 분석이 완료되었습니다.',
      overallAnalysis: response,  // 원본 텍스트를 전체 분석으로 사용
      recommendations: [],
      categoryAnalysis: {},
    };
  }
}

/**
 * 상담일지 생성용 프롬프트 생성
 */
export function createSessionReportPrompt(formData: {
  childName: string;
  sessionType: string;
  sessionNumber: number;
  sessionGoal: string;
  observation: string;
  activities: string;
  materials?: string;
  strengths?: string;
  concerns?: string;
  homeCoaching?: string;
  nextPlan?: string;
}): string {
  const sessionTypeNames: Record<string, string> = {
    SPEECH_THERAPY: '언어치료',
    SENSORY_INTEGRATION: '감각통합',
    PLAY_THERAPY: '놀이치료',
    ART_THERAPY: '미술치료',
    MUSIC_THERAPY: '음악치료',
    OCCUPATIONAL_THERAPY: '작업치료',
    COGNITIVE_THERAPY: '인지치료',
    BEHAVIORAL_THERAPY: '행동치료',
  };

  const sessionTypeName = sessionTypeNames[formData.sessionType] || formData.sessionType;

  return `당신은 아동 발달 치료 전문가입니다. 치료사가 작성한 세션 기록을 바탕으로 부모님께서 이해하기 쉽도록 상세하고 따뜻한 톤의 상담일지를 작성해주세요.

## 세션 정보
- 자녀명: ${formData.childName}
- 세션 유형: ${sessionTypeName}
- 회차: ${formData.sessionNumber}회차
- 세션 목표: ${formData.sessionGoal}

## 아동 상태 및 관찰
${formData.observation}

## 오늘 진행한 활동
${formData.activities}

${formData.materials ? `## 사용한 교구/자료\n${formData.materials}\n` : ''}

${formData.strengths ? `## 관찰된 강점\n${formData.strengths}\n` : ''}

${formData.concerns ? `## 주의가 필요한 부분\n${formData.concerns}\n` : ''}

${formData.homeCoaching ? `## 가정에서 해보면 좋을 활동\n${formData.homeCoaching}\n` : ''}

${formData.nextPlan ? `## 다음 세션 계획\n${formData.nextPlan}\n` : ''}

## 요청사항
위 정보를 바탕으로 부모님께 전달할 상담일지를 작성해주세요. 다음 구조로 작성해주세요:

1. **오늘 세션 개요**
   - 세션의 전반적인 목표와 진행 내용을 2-3문장으로 요약

2. **아이의 상태 및 관찰 내용**
   - 세션 중 관찰된 아이의 상태, 기분, 참여도 등을 자세히 설명
   - 긍정적인 부분과 주의가 필요한 부분을 균형있게 설명

3. **진행한 활동과 아이의 반응**
   - 어떤 활동을 했는지, 아이가 어떻게 반응했는지 구체적으로 설명
   - 사용한 교구나 자료가 있다면 함께 언급

4. **눈에 띄는 강점과 발전**
   - 아이가 잘하는 부분, 이전보다 나아진 부분을 구체적으로 설명
   - 부모님이 자녀의 성장을 느낄 수 있도록 격려하는 톤

5. **주의 깊게 살펴볼 부분**
   - 발달이나 행동에서 주의가 필요한 부분이 있다면 부드럽게 설명
   - 걱정스럽게 들리지 않도록 발전 가능성과 함께 언급

6. **가정에서의 활동 제안**
   - 일상생활에서 부모님과 함께 할 수 있는 활동 제안
   - 구체적이고 실천 가능한 팁 제공

7. **다음 세션 안내**
   - 다음 세션에서 집중할 내용이나 목표 안내
   - 연속성 있는 치료 계획 공유

**작성 시 유의사항:**
- 전문 용어는 가능한 쉬운 말로 풀어서 설명
- 따뜻하고 격려하는 톤 유지
- 긍정적인 면과 개선이 필요한 면을 균형있게 전달
- 구체적인 예시를 들어 이해하기 쉽게 작성
- 마크다운 형식으로 작성

부모님이 읽으시면서 자녀의 발달과 치료 과정을 명확히 이해하고, 가정에서도 도움을 줄 수 있도록 작성해주세요.`;
}

/**
 * 상담일지 자동 생성
 */
export async function generateSessionReport(formData: {
  childName: string;
  sessionType: string;
  sessionNumber: number;
  sessionGoal: string;
  observation: string;
  activities: string;
  materials?: string;
  strengths?: string;
  concerns?: string;
  homeCoaching?: string;
  nextPlan?: string;
}): Promise<string> {
  const prompt = createSessionReportPrompt(formData);

  return await generateText(prompt, {
    temperature: 0.7,
    maxOutputTokens: 4000, // 상담일지는 더 길 수 있으므로 토큰 수 증가
  });
}
