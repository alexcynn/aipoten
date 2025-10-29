/**
 * Vertex AI 연결 테스트 스크립트
 * 실행: npx tsx scripts/test-vertex-ai.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// .env 파일 로드
dotenv.config({ path: path.resolve(__dirname, '../.env') })

console.log('🔧 환경 변수 확인:')
console.log(`   GOOGLE_CLOUD_PROJECT_ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID ? '✓ 설정됨' : '✗ 없음'}`)
console.log(`   GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✓ 설정됨' : '✗ 없음'}`)
console.log()

import { generateText } from '../src/lib/services/vertexAIService'

async function testVertexAI() {
  console.log('🔍 Vertex AI 연결 테스트 시작...\n')

  try {
    console.log('📝 테스트 프롬프트 전송 중...')
    const result = await generateText(
      '안녕하세요! 간단하게 "테스트 성공"이라고 답변해주세요.',
      {
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    )

    console.log('\n✅ Vertex AI 연결 성공!')
    console.log('📄 응답 결과:')
    console.log('─'.repeat(50))
    console.log(result)
    console.log('─'.repeat(50))
    console.log('\n✨ 모든 테스트 통과! Vertex AI가 정상적으로 작동합니다.')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Vertex AI 연결 실패:')
    console.error(error)
    console.log('\n🔧 해결 방법:')
    console.log('1. .env 파일의 GOOGLE_CLOUD_PROJECT_ID 확인')
    console.log('2. google-credentials.json 파일이 프로젝트 루트에 있는지 확인')
    console.log('3. Google Cloud Console에서 Vertex AI API가 활성화되어 있는지 확인')
    console.log('4. 서비스 계정에 "Vertex AI 사용자" 권한이 있는지 확인')
    process.exit(1)
  }
}

testVertexAI()
