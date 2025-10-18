import { PrismaClient, DevelopmentCategory, QuestionLevel, AnswerType } from '@prisma/client'

const prisma = new PrismaClient()

interface QuestionData {
  category: DevelopmentCategory
  questionNumber: number
  level: QuestionLevel
  questionText: string
  answerType: AnswerType
  isWarning: boolean
  order: number
}

// 27-29개월 발달 체크 질문 데이터 (survey.txt 기반)
const assessmentQuestions: QuestionData[] = [
  // A. 대근육 운동 (GROSS_MOTOR) - 8문항

  // 문항 1
  {
    category: 'GROSS_MOTOR',
    questionNumber: 1,
    level: 'Q1',
    questionText: '제자리에서 양발을 모아 동시에 깡충 뛸 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 1
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 1,
    level: 'Q2',
    questionText: '보호자가 한 손을 잡아줄 때 양발을 모아 뛸 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 2
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 1,
    level: 'Q3',
    questionText: '양발 점프는 어렵지만, 보호자가 손을 잡아주면 한 발씩 번갈아 들며 작은 점프를 할 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 3
  },

  // 문항 2
  {
    category: 'GROSS_MOTOR',
    questionNumber: 2,
    level: 'Q1',
    questionText: '계단의 가장 낮은 층에서 양발을 모아 바닥으로 뛰어내릴 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 4
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 2,
    level: 'Q2',
    questionText: '보호자가 손을 잡아줄 때 낮은 층(또는 낮은 턱)에서 양발로 뛰어 내릴 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 5
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 2,
    level: 'Q3',
    questionText: '뛰어내리지는 못하지만, 보호자가 손을 잡아주면 낮은 층(또는 낮은 턱)에서 안전하게 내려올 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 6
  },

  // 문항 3
  {
    category: 'GROSS_MOTOR',
    questionNumber: 3,
    level: 'Q1',
    questionText: '서 있는 자세에서 팔을 들어 머리 위로 공을 앞으로 던질 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 7
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 3,
    level: 'Q2',
    questionText: '머리 위는 아니더라도, 가슴 높이에서 앞으로 공을 밀듯이 던지거나 어깨 아래에서 던질 수 있나요? (언더핸드)',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 8
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 3,
    level: 'Q3',
    questionText: '공을 잡고 서 있을 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 9
  },

  // 문항 4
  {
    category: 'GROSS_MOTOR',
    questionNumber: 4,
    level: 'Q1',
    questionText: '난간을 붙잡고 한발씩 번갈아 내디디며 계단을 올라갈수 있나요?(4계단)',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 10
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 4,
    level: 'Q2',
    questionText: '난간을 붙잡고 한발씩 번갈아 내디디며 계단을 올라갈 수 있나요? (1~2계단)',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 11
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 4,
    level: 'Q3',
    questionText: '보호자의 손을 잡고 낮은 턱이나 장애물을 넘어갈 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 12
  },

  // 문항 5
  {
    category: 'GROSS_MOTOR',
    questionNumber: 5,
    level: 'Q1',
    questionText: '발뒤꿈치를 들어 발끝으로 네 걸음 이상 걸을수 있나요?(까치발)',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 13
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 5,
    level: 'Q2',
    questionText: '제자리에서 발 뒤꿈치를 들어 까치발로 잠시 서 있을 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 14
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 5,
    level: 'Q3',
    questionText: '보호자의 손을 잡고 까치발로 몇 걸음을 걸을 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 15
  },

  // 문항 6
  {
    category: 'GROSS_MOTOR',
    questionNumber: 6,
    level: 'Q1',
    questionText: '난간 없이 한 계단에 양발을 모은 뒤, 한발씩 계단을 올라갈수 있나요?(4계단)',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 16
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 6,
    level: 'Q2',
    questionText: '난간 없이 한 계단에 양발을 모은뒤 한 발씩 계단을 올라갈 수 있나요? (1~2계단. 양발 모으기 방식)',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 17
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 6,
    level: 'Q3',
    questionText: '계단 오르기는 어려워하지만, 도움없이 평지에서 바닥의 장애물이나 낮은 턱을 올라갈 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 18
  },

  // 문항 7
  {
    category: 'GROSS_MOTOR',
    questionNumber: 7,
    level: 'Q1',
    questionText: '벽이나 가구를 살짝 짚고 한 발로 서 있을 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 19
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 7,
    level: 'Q2',
    questionText: '한발 서기는 못하지만 제자리에서 걷기를 하거나 스스로 10걸음 이상 걸을 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 20
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 7,
    level: 'Q3',
    questionText: '벽이나 가구를 살짝 짚고 한 발로 서 있을 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 21
  },

  // 문항 8
  {
    category: 'GROSS_MOTOR',
    questionNumber: 8,
    level: 'Q1',
    questionText: '난간 없이 한 계단에 양발을 모은 뒤, 한발씩 계단을 내려갈수 있나요?(4계단)',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 22
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 8,
    level: 'Q2',
    questionText: '난간 없이 한 계단에 양발을 모은 뒤 한 발씩 계단을 내려갈수 있나요? (1~2계단. 양발 모으기 방식)',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 23
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 8,
    level: 'Q3',
    questionText: '계단 내려가기는 어렵지만, 도움없이 평지에서 바닥의 장애물이나 낮은 턱을 내려갈 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 24
  },

  // B. 소근육 운동 (FINE_MOTOR) - 8문항

  // 문항 1
  {
    category: 'FINE_MOTOR',
    questionNumber: 1,
    level: 'Q1',
    questionText: '보호자가 만든 기차를 보고 스스로 블록을 나란히 놓아 기차 모양을 만들수 있나요? 또는 보호자가 요청할 때 블록으로 기차를 만들 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 25
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 1,
    level: 'Q2',
    questionText: '블록 두 개 이상을 옆으로 나란히 줄 세울 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 26
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 1,
    level: 'Q3',
    questionText: '블록 두 개를 양 손으로 잡고 서로 부딪히며 놀이를 할수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 27
  },

  // 문항 2
  {
    category: 'FINE_MOTOR',
    questionNumber: 2,
    level: 'Q1',
    questionText: '한 손으로 둥근 문손잡이를 잡고 돌려 문을 열 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 28
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 2,
    level: 'Q2',
    questionText: '둥근 손잡이는 못 돌리지만, 레버형 손잡이를 내리거나 올려서 열 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 29
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 2,
    level: 'Q3',
    questionText: '문 손잡이를 실제로 열지는 못하지만, 둥근 문 손잡이, 병뚜껑, 장난감 나사 등을 잡고 손목을 돌려 조작하려는 시도를 보이나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 30
  },

  // 문항 3
  {
    category: 'FINE_MOTOR',
    questionNumber: 3,
    level: 'Q1',
    questionText: '손바닥이 아래를 향한 상태로 연필을 감싸듯이 잡을 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 31
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 3,
    level: 'Q2',
    questionText: '연필을 주먹 쥐듯이 잡는 형태로 손바닥 전체로 쥐어 낙서 형태로 그리기를 할 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 32
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 3,
    level: 'Q3',
    questionText: '주먹쥐기 형태로 연필을 잡을 수 있으나 의도적으로 낙서하기 어려우며 종이 위를 두드리는 형태로 놀이를 하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 33
  },

  // 문항 4
  {
    category: 'FINE_MOTOR',
    questionNumber: 4,
    level: 'Q1',
    questionText: '아동용 가위를 이용하며 한 손으로 종이를 잡고 짧은 직선을 한 번 싹뚝 자를 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 34
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 4,
    level: 'Q2',
    questionText: '유아용 가위를 이용하며 종이 자르기 시도하나 정확도가 낮고 부분적으로 자르기 성공하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 35
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 4,
    level: 'Q3',
    questionText: '유아용 가위로 날을 벌렸다 오므리기 시도하나 종이를 자르지는 못하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 36
  },

  // 문항 5
  {
    category: 'FINE_MOTOR',
    questionNumber: 5,
    level: 'Q1',
    questionText: '큰 구슬과 두꺼운 끈을 이용해서 구슬 3~4개 이상을 끼울 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 37
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 5,
    level: 'Q2',
    questionText: '두꺼운 끈을 큰 구슬 구멍에 정확히 넣기 어려워 1개 정도 성공하는 모습을 보임. 도움을 받아 끼워 넣을 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 38
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 5,
    level: 'Q3',
    questionText: '끈에 구슬을 넣기 어려우나, 작은 물건을 엄지와 검지 손가락 끝으로 집을 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 39
  },

  // 문항 6
  {
    category: 'FINE_MOTOR',
    questionNumber: 6,
    level: 'Q1',
    questionText: '원을 그려주면 비슷하게 모방해서 그릴 수 있나요? (타원형, 완전히 닫히지 않고 틈이 있는 원의 형태)',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 40
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 6,
    level: 'Q2',
    questionText: '수평선은 아니더라도, 수직선(위아래로 긋는 선) 그리기 시범을 보여주면 흉내 내어 그리나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 41
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 6,
    level: 'Q3',
    questionText: '선이 아니어도 좌→우로 팔을 움직여 흔적 남기기가 되나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 42
  },

  // 문항 7
  {
    category: 'FINE_MOTOR',
    questionNumber: 7,
    level: 'Q1',
    questionText: '연필 보조도구 또는 손가락 위치 스티커를 이용하면 엄지, 검지, 중지로 잡기 시도할 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 43
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 7,
    level: 'Q2',
    questionText: '손바닥이 아래를 향한 상태로 연필을 감싸듯이 잡을 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 44
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 7,
    level: 'Q3',
    questionText: '작은 물체를 엄지+검지로 집기(핀치) 가 되나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 45
  },

  // 문항 8
  {
    category: 'FINE_MOTOR',
    questionNumber: 8,
    level: 'Q1',
    questionText: '큰 단추와 느슨한 구멍에서 자신의 단추를 끼우거나 풀 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 46
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 8,
    level: 'Q2',
    questionText: '엄지와 검지 손가락으로 단추 잡기 시작하며 구멍에서 빼려고 시도하나요? (정확하지는 않음)',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 47
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 8,
    level: 'Q3',
    questionText: '단추를 풀기 위해 단추를 잡고 여러 방향으로 돌리기 시도하나 단추를 잡고 구멍 안에 넣으려는 정확한 시도를 보이지 않나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 48
  },

  // C. 언어 (LANGUAGE) - 8문항

  // 문항 1
  {
    category: 'LANGUAGE',
    questionNumber: 1,
    level: 'Q1',
    questionText: '다양한 의미 관계로 3-4개 단어를 연결해 문장을 말할 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 49
  },
  {
    category: 'LANGUAGE',
    questionNumber: 1,
    level: 'Q2',
    questionText: '빈번하지는 않지만 3개 단어를 연결해서 표현하는 문장이 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 50
  },
  {
    category: 'LANGUAGE',
    questionNumber: 1,
    level: 'Q3',
    questionText: '다양한 의미관계의 2어조합이 빈번하게 나타나고 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 51
  },

  // 문항 2
  {
    category: 'LANGUAGE',
    questionNumber: 2,
    level: 'Q1',
    questionText: "'이게 뭐야?, 어디야?'라는 의문사 질문을 하나요?",
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 52
  },
  {
    category: 'LANGUAGE',
    questionNumber: 2,
    level: 'Q2',
    questionText: '말 끝을 올려서 물어보나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 53
  },
  {
    category: 'LANGUAGE',
    questionNumber: 2,
    level: 'Q3',
    questionText: '하지 않지만, 궁금한 것이 있을 때 손가락으로 가리키며 보호자를 쳐다보나요? (비언어적 질문)',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 54
  },

  // 문항 3
  {
    category: 'LANGUAGE',
    questionNumber: 3,
    level: 'Q1',
    questionText: '한 곳에 가서 한 번에 두가지 사물을 가지고 올 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 55
  },
  {
    category: 'LANGUAGE',
    questionNumber: 3,
    level: 'Q2',
    questionText: '한 곳에 가서 한 번에 한가지 사물만 가지고 올 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 56
  },
  {
    category: 'LANGUAGE',
    questionNumber: 3,
    level: 'Q3',
    questionText: '지시 수행에 어려움을 보이나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 57
  },

  // 문항 4
  {
    category: 'LANGUAGE',
    questionNumber: 4,
    level: 'Q1',
    questionText: '앞/뒤, 안/밖 등 상대적인 위치를 한 개 이상 이해하나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 58
  },
  {
    category: 'LANGUAGE',
    questionNumber: 4,
    level: 'Q2',
    questionText: '앞/뒤, 안/밖 등 상대적인 위치를 이해하지 못하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 59
  },
  {
    category: 'LANGUAGE',
    questionNumber: 4,
    level: 'Q3',
    questionText: '상대적인 위치가 포함되지 않은 한 단계 지시 따르는것에도 어려움을 보이나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 60
  },

  // 문항 5
  {
    category: 'LANGUAGE',
    questionNumber: 5,
    level: 'Q1',
    questionText: '그림책을 보고 "친구 뭐 해?" 질문에 한 단어로라도 답을 할 수 있나요?("잔다", "먹어")',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 61
  },
  {
    category: 'LANGUAGE',
    questionNumber: 5,
    level: 'Q2',
    questionText: '그림책을 보고 질문에 가리키기로 반응할 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 62
  },
  {
    category: 'LANGUAGE',
    questionNumber: 5,
    level: 'Q3',
    questionText: '그림책을 보고 질문에 반응을 어렵지만 아는 단어가 나오면 명명하기만 제한적으로 가능한가요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 63
  },

  // 문항 6
  {
    category: 'LANGUAGE',
    questionNumber: 6,
    level: 'Q1',
    questionText: "'나' 대명사를 사용해서 본인을 표현하나요?",
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 64
  },
  {
    category: 'LANGUAGE',
    questionNumber: 6,
    level: 'Q2',
    questionText: '이름으로 본인을 표현하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 65
  },
  {
    category: 'LANGUAGE',
    questionNumber: 6,
    level: 'Q3',
    questionText: '본인을 표현하지 않는다',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 66
  },

  // 문항 7
  {
    category: 'LANGUAGE',
    questionNumber: 7,
    level: 'Q1',
    questionText: "'누구, 무엇, 어디'의문사가 포함된 간단한 질문에 대해 이해하고 대답할 수 있나요?",
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 67
  },
  {
    category: 'LANGUAGE',
    questionNumber: 7,
    level: 'Q2',
    questionText: "'이게 뭐야?'라는 질문에 대해서만 이해하고 대답할 수 있나요?",
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 68
  },
  {
    category: 'LANGUAGE',
    questionNumber: 7,
    level: 'Q3',
    questionText: '어떤 질문에도 반응을 보이지 않는다',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 69
  },

  // 문항 8
  {
    category: 'LANGUAGE',
    questionNumber: 8,
    level: 'Q1',
    questionText: '공존격 조사(랑), 주격 조사(이/가)의 사용이 보이나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 70
  },
  {
    category: 'LANGUAGE',
    questionNumber: 8,
    level: 'Q2',
    questionText: '스스로 조사의 표현은 어려우나 모방으로 산출은 가능한가요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 71
  },
  {
    category: 'LANGUAGE',
    questionNumber: 8,
    level: 'Q3',
    questionText: '조사로도 모방하지 않는다',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 72
  },

  // D. 인지 (COGNITIVE) - 8문항

  // 문항 1
  {
    category: 'COGNITIVE',
    questionNumber: 1,
    level: 'Q1',
    questionText: '사람의 신체부위 (자신과 타인)와 인형의 신체부위를 5개 이상 가리킬 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 73
  },
  {
    category: 'COGNITIVE',
    questionNumber: 1,
    level: 'Q2',
    questionText: '자신의 신체부위는 5개 이상 가리킬 수 있고 타인의 신체 일부 (예 : 눈, 코, 입)를 질문하면 가리키기 시작하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 74
  },
  {
    category: 'COGNITIVE',
    questionNumber: 1,
    level: 'Q3',
    questionText: '자신의 신체부위 3개 이상 (예 : 눈, 코, 입)을 가리킬 수 있으나, 타인의 신체부위는 가리키기는 못함',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 75
  },

  // 문항 2
  {
    category: 'COGNITIVE',
    questionNumber: 2,
    level: 'Q1',
    questionText: '두 물건 중 큰 것/작은 것을 구분하나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 76
  },
  {
    category: 'COGNITIVE',
    questionNumber: 2,
    level: 'Q2',
    questionText: '크기 차이가 아주 많이 나는 두 물건(예: 농구공과 구슬)을 놓고 비교하면 큰 것/작은 것을 구분하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 77
  },
  {
    category: 'COGNITIVE',
    questionNumber: 2,
    level: 'Q3',
    questionText: '크다/작다에 대한 언어적인 개념을 이해하기 어려우나, 명확한 크기 차이가 있으면 큰 것에 먼저 반응을 보이나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 78
  },

  // 문항 3
  {
    category: 'COGNITIVE',
    questionNumber: 3,
    level: 'Q1',
    questionText: '빨·노·파 토막을 같은 색끼리 분류하나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 79
  },
  {
    category: 'COGNITIVE',
    questionNumber: 3,
    level: 'Q2',
    questionText: '세 가지 색은 못하지만, 두 가지 색(예: 빨강과 파랑)의 토막을 섞어 놓으면 같은 색끼리 분류할 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 80
  },
  {
    category: 'COGNITIVE',
    questionNumber: 3,
    level: 'Q3',
    questionText: '똑같은 색의 장난감이나 물건을 보고 같이 놓거나 같은색끼리 짝짓기 시도하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 81
  },

  // 문항 4
  {
    category: 'COGNITIVE',
    questionNumber: 4,
    level: 'Q1',
    questionText: '간단한 도형 맞추기 판에 세 조각 이상 맞출 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 82
  },
  {
    category: 'COGNITIVE',
    questionNumber: 4,
    level: 'Q2',
    questionText: '세 조각은 못하지만, 동그라미나 네모 한두 조각은 맞출 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 83
  },
  {
    category: 'COGNITIVE',
    questionNumber: 4,
    level: 'Q3',
    questionText: '도형판 위에 도형을 올리며 우연히 맞춰지거나, 동그라미와 같은 도형만 맞출 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 84
  },

  // 문항 5
  {
    category: 'COGNITIVE',
    questionNumber: 5,
    level: 'Q1',
    questionText: "'많다/적다'의 개념을 이해하나요?",
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 85
  },
  {
    category: 'COGNITIVE',
    questionNumber: 5,
    level: 'Q2',
    questionText: '개수 차이가 많이 나도록(예: 1개와 10개) 놓으면 어떤 것이 더 많은지 구분하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 86
  },
  {
    category: 'COGNITIVE',
    questionNumber: 5,
    level: 'Q3',
    questionText: '많고 적은 물체 중 많은 것을 선택하는 빈도가 높으나, 언어적 지시에 따라 많은 것을 선택할 수는 없음',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 87
  },

  // 문항 6
  {
    category: 'COGNITIVE',
    questionNumber: 6,
    level: 'Q1',
    questionText: "'하나'의 개념을 이해하나요?",
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 88
  },
  {
    category: 'COGNITIVE',
    questionNumber: 6,
    level: 'Q2',
    questionText: "'한 개만 주세요'라는 언어 지시에 부분적으로 수행하나요? (정확도가 낮아 실수하는 경우가 있음)",
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 89
  },
  {
    category: 'COGNITIVE',
    questionNumber: 6,
    level: 'Q3',
    questionText: '손가락 1개 표시 또는 한 개 가리키기로 의미 표현이 되나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 90
  },

  // 문항 7
  {
    category: 'COGNITIVE',
    questionNumber: 7,
    level: 'Q1',
    questionText: '여섯 조각 퍼즐을 맞출 수 있나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 91
  },
  {
    category: 'COGNITIVE',
    questionNumber: 7,
    level: 'Q2',
    questionText: '3–4조각 퍼즐로 줄이면 맞출 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 92
  },
  {
    category: 'COGNITIVE',
    questionNumber: 7,
    level: 'Q3',
    questionText: '평면 퍼즐 2조각 연결 또는 찢어진 그림 맞대기가 되나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 93
  },

  // 문항 8
  {
    category: 'COGNITIVE',
    questionNumber: 8,
    level: 'Q1',
    questionText: '두 선 중 길이가 긴/짧은 것을 구분하나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 94
  },
  {
    category: 'COGNITIVE',
    questionNumber: 8,
    level: 'Q2',
    questionText: '길이 차이가 아주 많이 나는 두 선(또는 막대)을 놓고 비교하면 긴 것/짧은 것을 구분하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 95
  },
  {
    category: 'COGNITIVE',
    questionNumber: 8,
    level: 'Q3',
    questionText: '길이 개념은 없지만, 두 선(또는 막대)이 \'같다/다르다\'는 것을 인식하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 96
  },

  // E. 사회성 (SOCIAL) - 8문항

  // 문항 1
  {
    category: 'SOCIAL',
    questionNumber: 1,
    level: 'Q1',
    questionText: '관심을 끌기 위해 손가락으로 가르키나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 97
  },
  {
    category: 'SOCIAL',
    questionNumber: 1,
    level: 'Q2',
    questionText: '멀리 있는 것은 아니더라도, 가까이 있는 흥미로운 물건을 가리키며 보호자를 쳐다보나요? (관심공유)',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 98
  },
  {
    category: 'SOCIAL',
    questionNumber: 1,
    level: 'Q3',
    questionText: '가르키지는 않지만, 흥미로운 것을 발견했을 때 소리를 내거나 보호자의 옷을 잡아당겨 관심을 유도하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 99
  },

  // 문항 2
  {
    category: 'SOCIAL',
    questionNumber: 2,
    level: 'Q1',
    questionText: '제한 시, 싫다를 말이나 동작으로 표현하나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 100
  },
  {
    category: 'SOCIAL',
    questionNumber: 2,
    level: 'Q2',
    questionText: '표정/몸짓/소리로 불만 표시가 되나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 101
  },
  {
    category: 'SOCIAL',
    questionNumber: 2,
    level: 'Q3',
    questionText: '거부 표현은 약하지만, 좋아하는 활동을 할 때 는 명확하게 즐거움을 표현하나요? (감정 반응성)',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 102
  },

  // 문항 3
  {
    category: 'SOCIAL',
    questionNumber: 3,
    level: 'Q1',
    questionText: '관심 끌기 위해 보여주기 행동을 하나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 103
  },
  {
    category: 'SOCIAL',
    questionNumber: 3,
    level: 'Q2',
    questionText: '좋아하는 장난감이나 물건을 보호자에게 가져와서 보여주나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 104
  },
  {
    category: 'SOCIAL',
    questionNumber: 3,
    level: 'Q3',
    questionText: '물건을 보여주지는 않지만, 보호자가 자신의 놀이에 참여하기를 원하나요? (같이 놀자고 조르기)',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 105
  },

  // 문항 4
  {
    category: 'SOCIAL',
    questionNumber: 4,
    level: 'Q1',
    questionText: '시키면 미안해/고마워라고 말하나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 106
  },
  {
    category: 'SOCIAL',
    questionNumber: 4,
    level: 'Q2',
    questionText: '상항 제공 후 모델링 따라 말하기가 되나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 107
  },
  {
    category: 'SOCIAL',
    questionNumber: 4,
    level: 'Q3',
    questionText: '말로는 못하지만, 상황에 맞는 행동 (예: 헤어질때 손 흔들기, 고개 숙여 인사하기)를 할 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 108
  },

  // 문항 5
  {
    category: 'SOCIAL',
    questionNumber: 5,
    level: 'Q1',
    questionText: '인형이나 다른 사물을 움직이고 행동할 수 있는 행위자로 가장하는 놀이가 나오나요? (인형을 행위자로 사용한다)',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 109
  },
  {
    category: 'SOCIAL',
    questionNumber: 5,
    level: 'Q2',
    questionText: '연속된 일련의 행동에서 두 가지 이상의 행동이 나오나요?(과일을 자른다-접시에 담는다-인형에게 먹인다)',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 110
  },
  {
    category: 'SOCIAL',
    questionNumber: 5,
    level: 'Q3',
    questionText: '자신의 몸을 중심으로 하는 상징놀이가 나오나요?(컵을 들고 마시는 흉내)',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 111
  },

  // 문항 6
  {
    category: 'SOCIAL',
    questionNumber: 6,
    level: 'Q1',
    questionText: '자신의 상태나 감정을 기분을 말로 표현하나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 112
  },
  {
    category: 'SOCIAL',
    questionNumber: 6,
    level: 'Q2',
    questionText: '기분을 말로 표현하지는 못하지만, 표정이나 행동(웃음, 울음, 짜증)으로 좋고 나쁨이 명확히 드러나나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 113
  },
  {
    category: 'SOCIAL',
    questionNumber: 6,
    level: 'Q3',
    questionText: '자신의 감정 표현은 어렵지만, 서툴지만, 표정 등을 보고 보호자의 감정기분(화남, 슬픔)을 알아차리고 반응하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 114
  },

  // 문항 7
  {
    category: 'SOCIAL',
    questionNumber: 7,
    level: 'Q1',
    questionText: '닿지 않는 물건을 부탁하나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 115
  },
  {
    category: 'SOCIAL',
    questionNumber: 7,
    level: 'Q2',
    questionText: '문장으로 부탁하지는 못하지만, 원하는 물건을 가리키며 "줘" 또는 단어로 요청할 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 116
  },
  {
    category: 'SOCIAL',
    questionNumber: 7,
    level: 'Q3',
    questionText: '말로 부탁하지 못하지만, 보호자의 손을 끌어다가 원하는 곳에 대는 행동(도구적 사용)으로 도움을 요청하나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 117
  },

  // 문항 8
  {
    category: 'SOCIAL',
    questionNumber: 8,
    level: 'Q1',
    questionText: '어른이 이끄는 집단 놀이 규칙을 따르나요?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 118
  },
  {
    category: 'SOCIAL',
    questionNumber: 8,
    level: 'Q2',
    questionText: '2인 상호작용에서 규칙 1개 지키기가 되나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 119
  },
  {
    category: 'SOCIAL',
    questionNumber: 8,
    level: 'Q3',
    questionText: '모방 놀이에서 성인 지시 1회 따르기가 되나요?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 120
  },

  // ===== 경고 문항 (Warning Questions) - 5문항 =====

  // 경고 문항 1: 보행 능력
  {
    category: 'GROSS_MOTOR',
    questionNumber: 41,
    level: 'Q1',
    questionText: '걸을 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 121
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 41,
    level: 'Q2',
    questionText: '보호자의 손을 잡거나 보행보조도구를 잡고 걸을 수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 122
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 41,
    level: 'Q3',
    questionText: '보호자의 손을 잡고 서거나 기구를 잡고 서 있을수 있나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 123
  },

  // 경고 문항 2: 언어 산출
  {
    category: 'LANGUAGE',
    questionNumber: 42,
    level: 'Q1',
    questionText: '의미 있는 단어를 말하지 못하나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 124
  },
  {
    category: 'LANGUAGE',
    questionNumber: 42,
    level: 'Q2',
    questionText: '발성을 동반한 의미있는 관습적 제스처 사용이 있나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 125
  },
  {
    category: 'LANGUAGE',
    questionNumber: 42,
    level: 'Q3',
    questionText: '의미가 없더라도 소리 산출이 있나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 126
  },

  // 경고 문항 3: 눈 맞춤
  {
    category: 'SOCIAL',
    questionNumber: 43,
    level: 'Q1',
    questionText: '평상시 보호자와 눈을 잘 맞추지 않나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 127
  },
  {
    category: 'SOCIAL',
    questionNumber: 43,
    level: 'Q2',
    questionText: '도움을 청하는 상황에서는 보호자의 눈을 쳐다본다',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 128
  },
  {
    category: 'SOCIAL',
    questionNumber: 43,
    level: 'Q3',
    questionText: '도움을 청하는 상황에서도 보호자의 눈을 잘 맞추지 않는다',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 129
  },

  // 경고 문항 4: 이름 반응
  {
    category: 'SOCIAL',
    questionNumber: 44,
    level: 'Q1',
    questionText: '이름을 불러도 대부분 쳐다보지 않나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 130
  },
  {
    category: 'SOCIAL',
    questionNumber: 44,
    level: 'Q2',
    questionText: '조용한 환경·근거리에서 불렀을 때 반응하나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 131
  },
  {
    category: 'SOCIAL',
    questionNumber: 44,
    level: 'Q3',
    questionText: '다른 소리(박수/벨)에는 반응하나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 132
  },

  // 경고 문항 5: 공동 주의
  {
    category: 'SOCIAL',
    questionNumber: 45,
    level: 'Q1',
    questionText: '좋아하는 장난감을 가져와서 같이 하자고 하나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 133
  },
  {
    category: 'SOCIAL',
    questionNumber: 45,
    level: 'Q2',
    questionText: '보호자가 장난감을 가져왔을 때 관심을 보이나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 134
  },
  {
    category: 'SOCIAL',
    questionNumber: 45,
    level: 'Q3',
    questionText: '보호자가 장난감으로 반응을 유도하면 반응을 보이나요?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 135
  }
]

export async function seedAssessmentQuestions() {
  console.log('🌱 발달 체크 질문 데이터 생성 시작...')

  // 27-29개월 기준으로 설정
  const ageMin = 27
  const ageMax = 29

  // 기존 질문 삭제
  await prisma.assessmentQuestion.deleteMany({})
  console.log('✅ 기존 질문 데이터 삭제 완료')

  // 새로운 질문 생성
  for (const questionData of assessmentQuestions) {
    await prisma.assessmentQuestion.create({
      data: {
        ...questionData,
        ageMin,
        ageMax
      }
    })
  }

  const totalQuestions = assessmentQuestions.length
  const regularQuestions = assessmentQuestions.filter(q => !q.isWarning).length
  const warningQuestions = assessmentQuestions.filter(q => q.isWarning).length

  console.log(`✅ 발달 체크 질문 데이터 생성 완료`)
  console.log(`   총 질문: ${totalQuestions}개`)
  console.log(`   일반 질문: ${regularQuestions}개 (40문항 × 3레벨)`)
  console.log(`   경고 질문: ${warningQuestions}개 (5문항 × 3레벨)`)
  console.log(`   대상 월령: ${ageMin}-${ageMax}개월`)
}

export default seedAssessmentQuestions
