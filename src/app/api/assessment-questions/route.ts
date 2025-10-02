import { NextRequest, NextResponse } from 'next/server'

// 발달 평가 질문 데이터 (실제로는 데이터베이스에서 가져와야 함)
const assessmentQuestions = [
  // 0-6개월
  { id: '1', category: '대근육 운동', question: '목을 가누고 있을 수 있나요?', ageMin: 0, ageMax: 6 },
  { id: '2', category: '대근육 운동', question: '엎드려 있을 때 머리를 들 수 있나요?', ageMin: 0, ageMax: 6 },
  { id: '3', category: '소근육 운동', question: '손을 쥐었다 폈다 할 수 있나요?', ageMin: 0, ageMax: 6 },
  { id: '4', category: '소근육 운동', question: '손에 닿는 물건을 잡으려고 하나요?', ageMin: 0, ageMax: 6 },
  { id: '5', category: '인지/언어', question: '소리가 나는 방향으로 고개를 돌리나요?', ageMin: 0, ageMax: 6 },
  { id: '6', category: '인지/언어', question: '익숙한 사람과 낯선 사람을 구분하나요?', ageMin: 0, ageMax: 6 },
  { id: '7', category: '사회성/정서', question: '사람과 눈을 맞추나요?', ageMin: 0, ageMax: 6 },
  { id: '8', category: '사회성/정서', question: '웃음소리를 내며 웃나요?', ageMin: 0, ageMax: 6 },

  // 7-12개월
  { id: '9', category: '대근육 운동', question: '혼자 앉아 있을 수 있나요?', ageMin: 7, ageMax: 12 },
  { id: '10', category: '대근육 운동', question: '배밀이나 기어다니기를 하나요?', ageMin: 7, ageMax: 12 },
  { id: '11', category: '소근육 운동', question: '엄지와 검지로 작은 물건을 집을 수 있나요?', ageMin: 7, ageMax: 12 },
  { id: '12', category: '소근육 운동', question: '물건을 한 손에서 다른 손으로 옮길 수 있나요?', ageMin: 7, ageMax: 12 },
  { id: '13', category: '인지/언어', question: '간단한 말(엄마, 아빠 등)을 할 수 있나요?', ageMin: 7, ageMax: 12 },
  { id: '14', category: '인지/언어', question: '자신의 이름을 부르면 반응하나요?', ageMin: 7, ageMax: 12 },
  { id: '15', category: '사회성/정서', question: '까꿍 놀이를 즐기나요?', ageMin: 7, ageMax: 12 },
  { id: '16', category: '사회성/정서', question: '손 흔들며 인사할 수 있나요?', ageMin: 7, ageMax: 12 },

  // 13-18개월
  { id: '17', category: '대근육 운동', question: '혼자 걸을 수 있나요?', ageMin: 13, ageMax: 18 },
  { id: '18', category: '대근육 운동', question: '계단을 기어 올라갈 수 있나요?', ageMin: 13, ageMax: 18 },
  { id: '19', category: '소근육 운동', question: '컵을 들고 물을 마실 수 있나요?', ageMin: 13, ageMax: 18 },
  { id: '20', category: '소근육 운동', question: '큰 크레용으로 끄적거릴 수 있나요?', ageMin: 13, ageMax: 18 },
  { id: '21', category: '인지/언어', question: '2-3개의 단어를 말할 수 있나요?', ageMin: 13, ageMax: 18 },
  { id: '22', category: '인지/언어', question: '간단한 지시를 따를 수 있나요?', ageMin: 13, ageMax: 18 },
  { id: '23', category: '사회성/정서', question: '다른 아이들에게 관심을 보이나요?', ageMin: 13, ageMax: 18 },
  { id: '24', category: '사회성/정서', question: '간단한 상호작용 놀이를 할 수 있나요?', ageMin: 13, ageMax: 18 },

  // 19-24개월
  { id: '25', category: '대근육 운동', question: '뛸 수 있나요?', ageMin: 19, ageMax: 24 },
  { id: '26', category: '대근육 운동', question: '공을 차거나 던질 수 있나요?', ageMin: 19, ageMax: 24 },
  { id: '27', category: '소근육 운동', question: '숟가락을 사용해 혼자 먹을 수 있나요?', ageMin: 19, ageMax: 24 },
  { id: '28', category: '소근육 운동', question: '블록을 3-4개 쌓을 수 있나요?', ageMin: 19, ageMax: 24 },
  { id: '29', category: '인지/언어', question: '2어문을 사용해 말할 수 있나요?', ageMin: 19, ageMax: 24 },
  { id: '30', category: '인지/언어', question: '몸의 부위를 가리킬 수 있나요?', ageMin: 19, ageMax: 24 },
  { id: '31', category: '사회성/정서', question: '다른 사람을 모방하려고 하나요?', ageMin: 19, ageMax: 24 },
  { id: '32', category: '사회성/정서', question: '독립적으로 놀려고 하나요?', ageMin: 19, ageMax: 24 },

  // 25-36개월
  { id: '33', category: '대근육 운동', question: '세발자전거를 탈 수 있나요?', ageMin: 25, ageMax: 36 },
  { id: '34', category: '대근육 운동', question: '한 발로 서있을 수 있나요?', ageMin: 25, ageMax: 36 },
  { id: '35', category: '소근육 운동', question: '가위로 종이를 자를 수 있나요?', ageMin: 25, ageMax: 36 },
  { id: '36', category: '소근육 운동', question: '그림을 그리고 무엇인지 설명할 수 있나요?', ageMin: 25, ageMax: 36 },
  { id: '37', category: '인지/언어', question: '3어문 이상으로 말할 수 있나요?', ageMin: 25, ageMax: 36 },
  { id: '38', category: '인지/언어', question: '색깔을 구분할 수 있나요?', ageMin: 25, ageMax: 36 },
  { id: '39', category: '사회성/정서', question: '다른 아이들과 함께 놀 수 있나요?', ageMin: 25, ageMax: 36 },
  { id: '40', category: '사회성/정서', question: '감정을 말로 표현할 수 있나요?', ageMin: 25, ageMax: 36 }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ageInMonths = parseInt(searchParams.get('ageInMonths') || '0')

    if (!ageInMonths) {
      return NextResponse.json(
        { error: '월령 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // 해당 월령에 맞는 질문들 필터링
    const relevantQuestions = assessmentQuestions.filter(
      question => ageInMonths >= question.ageMin && ageInMonths <= question.ageMax
    )

    // 월령이 범위를 벗어나는 경우 가장 가까운 범위의 질문들 제공
    if (relevantQuestions.length === 0) {
      let fallbackQuestions
      if (ageInMonths < 7) {
        fallbackQuestions = assessmentQuestions.filter(q => q.ageMax <= 6)
      } else if (ageInMonths > 36) {
        fallbackQuestions = assessmentQuestions.filter(q => q.ageMin >= 25)
      } else {
        // 중간 범위에서 가장 가까운 질문들 찾기
        fallbackQuestions = assessmentQuestions.filter(q =>
          Math.abs((q.ageMin + q.ageMax) / 2 - ageInMonths) <= 6
        )
      }

      return NextResponse.json(fallbackQuestions.length > 0 ? fallbackQuestions : assessmentQuestions.slice(0, 8))
    }

    return NextResponse.json(relevantQuestions)

  } catch (error) {
    console.error('평가 질문 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}