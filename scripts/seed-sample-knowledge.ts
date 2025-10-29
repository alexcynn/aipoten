/**
 * 샘플 지식 베이스 데이터 시딩
 * 실행: npx tsx scripts/seed-sample-knowledge.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedKnowledgeBase() {
  console.log('🌱 샘플 지식 베이스 데이터 생성 시작...\n')

  const sampleData = [
    {
      title: '27-29개월 대근육 발달 이정표',
      content: `27-29개월 아이의 대근육 발달:
- 계단을 번갈아 가며 올라갈 수 있습니다
- 두 발로 점프할 수 있습니다
- 공을 발로 찰 수 있습니다
- 세발자전거 페달을 밟을 수 있습니다
- 한 발로 잠깐 서 있을 수 있습니다

발달이 느린 경우:
- 혼자 계단을 오르지 못함
- 달리기가 불안정함
- 균형 잡기가 어려움

권장 활동:
- 공놀이 (던지기, 차기)
- 계단 오르내리기 연습
- 놀이터에서 다양한 기구 체험`,
      category: 'GROSS_MOTOR',
      ageMin: 27,
      ageMax: 29,
      isActive: true,
    },
    {
      title: '27-29개월 언어 발달 이정표',
      content: `27-29개월 아이의 언어 발달:
- 2-3단어 문장을 사용합니다 ("엄마 물 줘")
- 약 50-200개 단어를 말할 수 있습니다
- "뭐야?", "어디?"와 같은 질문을 합니다
- 간단한 지시사항을 따릅니다
- 자신의 이름을 말할 수 있습니다

발달이 느린 경우:
- 단어가 10개 미만
- 두 단어 조합을 하지 못함
- 간단한 지시를 이해하지 못함

권장 활동:
- 그림책 읽기
- 노래 부르기
- 일상생활 대화 늘리기
- 사물 이름 말하기 게임`,
      category: 'LANGUAGE',
      ageMin: 27,
      ageMax: 29,
      isActive: true,
    },
    {
      title: '27-29개월 인지 발달 이정표',
      content: `27-29개월 아이의 인지 발달:
- 색깔을 구분하기 시작합니다
- 간단한 퍼즐(3-4조각)을 맞출 수 있습니다
- 크기 비교를 이해합니다 (큰 것, 작은 것)
- 상상 놀이를 시작합니다
- 물건을 기능별로 분류할 수 있습니다

발달이 느린 경우:
- 간단한 지시를 이해하지 못함
- 모방 놀이를 하지 않음
- 물건을 용도대로 사용하지 못함

권장 활동:
- 블록 쌓기
- 모양 맞추기 놀이
- 역할 놀이 (소꿉놀이)
- 색깔 분류 게임`,
      category: 'COGNITIVE',
      ageMin: 27,
      ageMax: 29,
      isActive: true,
    },
    {
      title: '언어 발달 지연 시 치료 가이드',
      content: `언어 발달 지연이 의심될 때:

조기 중재의 중요성:
- 언어 발달의 골든 타임은 만 3세 이전입니다
- 조기 발견과 치료가 예후를 크게 개선합니다

언어치료 대상:
- 24개월에 단어가 10개 미만
- 30개월에 두 단어 조합을 하지 못함
- 36개월에 간단한 문장을 만들지 못함

언어치료 내용:
- 어휘력 향상 훈련
- 문장 구성 능력 발달
- 의사소통 기술 향상
- 부모 교육 및 상담

가정에서 할 수 있는 활동:
- 하루 30분 이상 그림책 읽기
- 일상생활에서 지속적인 언어 자극
- 아이의 관심사에 맞춘 대화`,
      category: 'LANGUAGE',
      ageMin: 12,
      ageMax: 48,
      isActive: true,
    },
    {
      title: '소근육 발달을 위한 놀이 활동',
      content: `소근육 발달 촉진 활동:

일상생활 활동:
- 단추 끼우기, 지퍼 잠그기
- 숟가락, 포크 사용하기
- 양치질하기
- 옷 입고 벗기

놀이 활동:
- 블록 쌓기 (다양한 크기)
- 점토 놀이 (주무르기, 모양 만들기)
- 구슬 꿰기
- 가위질 (안전 가위로)
- 물감 그림 그리기

주의사항:
- 아이의 속도에 맞춰 진행
- 성공 경험을 많이 제공
- 무리하게 강요하지 않기
- 손 근육이 충분히 발달한 후 진행`,
      category: 'FINE_MOTOR',
      ageMin: 24,
      ageMax: 36,
      isActive: true,
    },
  ]

  try {
    for (const data of sampleData) {
      await prisma.knowledgeBase.create({
        data,
      })
      console.log(`✅ "${data.title}" 생성 완료`)
    }

    console.log(`\n🎉 총 ${sampleData.length}개의 샘플 지식 항목이 생성되었습니다!`)
    console.log('\n📝 관리자 페이지에서 확인하세요:')
    console.log('   http://localhost:3000/admin/knowledge-base')
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedKnowledgeBase()
