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

// 27-29개월 발달 체크 질문 데이터
const assessmentQuestions: QuestionData[] = [
  // A. 대근육 운동 (8문항)
  {
    category: 'GROSS_MOTOR',
    questionNumber: 1,
    level: 'Q1',
    questionText: '아이가 두 발을 모아서 앞으로 깡충 뛰어 넘습니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 1
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 1,
    level: 'Q2',
    questionText: '아이가 한 발로 앞으로 뛰어 넘습니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 2
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 1,
    level: 'Q3',
    questionText: '아이가 두 발을 모아서 제자리에서 깡충 뜁니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 3
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 2,
    level: 'Q1',
    questionText: '아이가 난간을 잡지 않고 한 발씩 번갈아 디디며 계단을 오릅니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 4
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 2,
    level: 'Q2',
    questionText: '아이가 난간을 잡고 한 발씩 번갈아 디디며 계단을 오릅니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 5
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 2,
    level: 'Q3',
    questionText: '아이가 난간을 잡고 두 발을 모아서 계단을 오릅니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 6
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 3,
    level: 'Q1',
    questionText: '아이가 공을 던질 때 팔을 어깨 위로 들어서 던집니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 7
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 3,
    level: 'Q2',
    questionText: '아이가 공을 던질 때 팔을 어깨 아래로 해서 던집니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 8
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 3,
    level: 'Q3',
    questionText: '아이가 공을 잡으려고 시도합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 9
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 4,
    level: 'Q1',
    questionText: '아이가 공을 앞으로 찹니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 10
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 4,
    level: 'Q2',
    questionText: '아이가 공을 발로 밀어냅니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 11
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 4,
    level: 'Q3',
    questionText: '아이가 공을 향해 달려 갑니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 12
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 5,
    level: 'Q1',
    questionText: '아이가 세발자전거의 페달을 밟아서 바퀴를 굴립니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 13
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 5,
    level: 'Q2',
    questionText: '아이가 세발자전거에 올라가 발로 땅을 밀며 앞으로 나아갑니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 14
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 5,
    level: 'Q3',
    questionText: '아이가 세발자전거에 올라가 앉아 있습니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 15
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 6,
    level: 'Q1',
    questionText: '아이가 한 발로 1초 정도 섭니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 16
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 6,
    level: 'Q2',
    questionText: '아이가 한 발을 들어 올립니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 17
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 6,
    level: 'Q3',
    questionText: '아이가 한 발로 서려고 시도합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 18
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 7,
    level: 'Q1',
    questionText: '아이가 까치발로 몇 걸음 걷습니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 19
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 7,
    level: 'Q2',
    questionText: '아이가 까치발로 섭니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 20
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 7,
    level: 'Q3',
    questionText: '아이가 까치발로 서려고 시도합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 21
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 8,
    level: 'Q1',
    questionText: '아이가 난간을 잡지 않고 발을 모아 계단을 내려 옵니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 22
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 8,
    level: 'Q2',
    questionText: '아이가 난간을 잡고 발을 모아 계단을 내려 옵니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 23
  },
  {
    category: 'GROSS_MOTOR',
    questionNumber: 8,
    level: 'Q3',
    questionText: '아이가 난간을 잡고 엉덩이를 대고 앉아서 계단을 내려 옵니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 24
  },

  // B. 소근육 운동 (8문항)
  {
    category: 'FINE_MOTOR',
    questionNumber: 9,
    level: 'Q1',
    questionText: '아이가 색연필이나 크레용으로 원을 그립니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 25
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 9,
    level: 'Q2',
    questionText: '아이가 색연필이나 크레용으로 세로선을 그립니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 26
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 9,
    level: 'Q3',
    questionText: '아이가 색연필이나 크레용으로 왔다 갔다 선을 그립니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 27
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 10,
    level: 'Q1',
    questionText: '아이가 색연필이나 크레용을 손가락으로 쥡니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 28
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 10,
    level: 'Q2',
    questionText: '아이가 색연필이나 크레용을 손바닥 전체로 쥡니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 29
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 10,
    level: 'Q3',
    questionText: '아이가 색연필이나 크레용을 주먹으로 쥡니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 30
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 11,
    level: 'Q1',
    questionText: '아이가 블록으로 7개 이상 쌓습니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 31
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 11,
    level: 'Q2',
    questionText: '아이가 블록으로 4-6개 쌓습니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 32
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 11,
    level: 'Q3',
    questionText: '아이가 블록으로 2-3개 쌓습니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 33
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 12,
    level: 'Q1',
    questionText: '아이가 가위로 종이를 직선으로 자릅니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 34
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 12,
    level: 'Q2',
    questionText: '아이가 가위로 종이를 마구 자릅니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 35
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 12,
    level: 'Q3',
    questionText: '아이가 가위를 사용하려고 합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 36
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 13,
    level: 'Q1',
    questionText: '아이가 책장을 한 장씩 넘깁니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 37
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 13,
    level: 'Q2',
    questionText: '아이가 책장을 두세 장씩 넘깁니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 38
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 13,
    level: 'Q3',
    questionText: '아이가 책장을 넘기려고 시도합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 39
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 14,
    level: 'Q1',
    questionText: '아이가 병뚜껑을 돌려서 엽니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 40
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 14,
    level: 'Q2',
    questionText: '아이가 병뚜껑을 열려고 시도합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 41
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 14,
    level: 'Q3',
    questionText: '아이가 뚜껑을 당겨서 엽니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 42
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 15,
    level: 'Q1',
    questionText: '아이가 단추 구멍에 단추를 끼웁니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 43
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 15,
    level: 'Q2',
    questionText: '아이가 단추를 채우려고 시도합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 44
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 15,
    level: 'Q3',
    questionText: '아이가 지퍼를 올리고 내립니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 45
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 16,
    level: 'Q1',
    questionText: '아이가 숟가락으로 음식을 흘리지 않고 먹습니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 46
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 16,
    level: 'Q2',
    questionText: '아이가 숟가락으로 음식을 조금 흘리며 먹습니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 47
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 16,
    level: 'Q3',
    questionText: '아이가 숟가락으로 음식을 많이 흘리며 먹습니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 48
  },

  // C. 언어 (7문항)
  {
    category: 'LANGUAGE',
    questionNumber: 17,
    level: 'Q1',
    questionText: '아이가 "안에", "위에"를 구별하여 사용합니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 49
  },
  {
    category: 'LANGUAGE',
    questionNumber: 17,
    level: 'Q2',
    questionText: '아이가 "안에", "위에"를 말합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 50
  },
  {
    category: 'LANGUAGE',
    questionNumber: 17,
    level: 'Q3',
    questionText: '아이가 "안에", "위에"를 이해합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 51
  },
  {
    category: 'LANGUAGE',
    questionNumber: 18,
    level: 'Q1',
    questionText: '아이가 자기 이름을 말합니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 52
  },
  {
    category: 'LANGUAGE',
    questionNumber: 18,
    level: 'Q2',
    questionText: '아이가 이름을 부르면 대답합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 53
  },
  {
    category: 'LANGUAGE',
    questionNumber: 18,
    level: 'Q3',
    questionText: '아이가 이름을 부르면 쳐다봅니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 54
  },
  {
    category: 'LANGUAGE',
    questionNumber: 19,
    level: 'Q1',
    questionText: '아이가 "크다", "작다"를 구별하여 사용합니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 55
  },
  {
    category: 'LANGUAGE',
    questionNumber: 19,
    level: 'Q2',
    questionText: '아이가 "크다", "작다"를 말합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 56
  },
  {
    category: 'LANGUAGE',
    questionNumber: 19,
    level: 'Q3',
    questionText: '아이가 "크다", "작다"를 이해합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 57
  },
  {
    category: 'LANGUAGE',
    questionNumber: 20,
    level: 'Q1',
    questionText: '아이가 "많다", "적다"를 구별하여 사용합니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 58
  },
  {
    category: 'LANGUAGE',
    questionNumber: 20,
    level: 'Q2',
    questionText: '아이가 "많다", "적다"를 말합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 59
  },
  {
    category: 'LANGUAGE',
    questionNumber: 20,
    level: 'Q3',
    questionText: '아이가 "많다", "적다"를 이해합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 60
  },
  {
    category: 'LANGUAGE',
    questionNumber: 21,
    level: 'Q1',
    questionText: '아이가 5개 이상의 신체 부위를 지적합니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 61
  },
  {
    category: 'LANGUAGE',
    questionNumber: 21,
    level: 'Q2',
    questionText: '아이가 3-4개의 신체 부위를 지적합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 62
  },
  {
    category: 'LANGUAGE',
    questionNumber: 21,
    level: 'Q3',
    questionText: '아이가 1-2개의 신체 부위를 지적합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 63
  },
  {
    category: 'LANGUAGE',
    questionNumber: 22,
    level: 'Q1',
    questionText: '아이가 3개 정도의 낱말로 문장을 만듭니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 64
  },
  {
    category: 'LANGUAGE',
    questionNumber: 22,
    level: 'Q2',
    questionText: '아이가 2개 정도의 낱말로 문장을 만듭니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 65
  },
  {
    category: 'LANGUAGE',
    questionNumber: 22,
    level: 'Q3',
    questionText: '아이가 한 낱말로 말합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 66
  },
  {
    category: 'LANGUAGE',
    questionNumber: 23,
    level: 'Q1',
    questionText: '아이가 "나", "너"를 구별하여 사용합니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 67
  },
  {
    category: 'LANGUAGE',
    questionNumber: 23,
    level: 'Q2',
    questionText: '아이가 "나", "너"를 말합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 68
  },
  {
    category: 'LANGUAGE',
    questionNumber: 23,
    level: 'Q3',
    questionText: '아이가 "나", "너"를 이해합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 69
  },

  // D. 인지 (8문항)
  {
    category: 'COGNITIVE',
    questionNumber: 24,
    level: 'Q1',
    questionText: '아이가 색깔 이름을 3개 이상 말합니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 70
  },
  {
    category: 'COGNITIVE',
    questionNumber: 24,
    level: 'Q2',
    questionText: '아이가 색깔 이름을 1-2개 말합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 71
  },
  {
    category: 'COGNITIVE',
    questionNumber: 24,
    level: 'Q3',
    questionText: '아이가 같은 색깔끼리 짝을 지어 줍니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 72
  },
  {
    category: 'COGNITIVE',
    questionNumber: 25,
    level: 'Q1',
    questionText: '아이가 3까지 셉니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 73
  },
  {
    category: 'COGNITIVE',
    questionNumber: 25,
    level: 'Q2',
    questionText: '아이가 2까지 셉니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 74
  },
  {
    category: 'COGNITIVE',
    questionNumber: 25,
    level: 'Q3',
    questionText: '아이가 1까지 셉니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 75
  },
  {
    category: 'COGNITIVE',
    questionNumber: 26,
    level: 'Q1',
    questionText: '아이가 "하나" 개념을 이해합니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 76
  },
  {
    category: 'COGNITIVE',
    questionNumber: 26,
    level: 'Q2',
    questionText: '아이가 "하나"라는 말을 합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 77
  },
  {
    category: 'COGNITIVE',
    questionNumber: 26,
    level: 'Q3',
    questionText: '아이가 "하나"라는 말을 이해합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 78
  },
  {
    category: 'COGNITIVE',
    questionNumber: 27,
    level: 'Q1',
    questionText: '아이가 같은 모양끼리 짝을 지어 줍니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 79
  },
  {
    category: 'COGNITIVE',
    questionNumber: 27,
    level: 'Q2',
    questionText: '아이가 같은 모양을 찾습니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 80
  },
  {
    category: 'COGNITIVE',
    questionNumber: 27,
    level: 'Q3',
    questionText: '아이가 원, 네모를 구별합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 81
  },
  {
    category: 'COGNITIVE',
    questionNumber: 28,
    level: 'Q1',
    questionText: '아이가 간단한 퍼즐(4-6조각)을 맞춥니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 82
  },
  {
    category: 'COGNITIVE',
    questionNumber: 28,
    level: 'Q2',
    questionText: '아이가 간단한 퍼즐(2-3조각)을 맞춥니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 83
  },
  {
    category: 'COGNITIVE',
    questionNumber: 28,
    level: 'Q3',
    questionText: '아이가 퍼즐 조각을 끼워 넣습니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 84
  },
  {
    category: 'COGNITIVE',
    questionNumber: 29,
    level: 'Q1',
    questionText: '아이가 성별의 차이를 압니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 85
  },
  {
    category: 'COGNITIVE',
    questionNumber: 29,
    level: 'Q2',
    questionText: '아이가 자신의 성별을 말합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 86
  },
  {
    category: 'COGNITIVE',
    questionNumber: 29,
    level: 'Q3',
    questionText: '아이가 남자와 여자를 구별합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 87
  },
  {
    category: 'COGNITIVE',
    questionNumber: 30,
    level: 'Q1',
    questionText: '아이가 그림을 보고 3개 이상의 사물 이름을 말합니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 88
  },
  {
    category: 'COGNITIVE',
    questionNumber: 30,
    level: 'Q2',
    questionText: '아이가 그림을 보고 1-2개의 사물 이름을 말합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 89
  },
  {
    category: 'COGNITIVE',
    questionNumber: 30,
    level: 'Q3',
    questionText: '아이가 그림을 보고 소리나 몸짓으로 표현합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 90
  },
  {
    category: 'COGNITIVE',
    questionNumber: 31,
    level: 'Q1',
    questionText: '아이가 물건의 쓰임새를 압니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 91
  },
  {
    category: 'COGNITIVE',
    questionNumber: 31,
    level: 'Q2',
    questionText: '아이가 물건의 이름을 압니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 92
  },
  {
    category: 'COGNITIVE',
    questionNumber: 31,
    level: 'Q3',
    questionText: '아이가 익숙한 물건을 찾습니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 93
  },

  // E. 사회성 (4문항)
  {
    category: 'SOCIAL',
    questionNumber: 32,
    level: 'Q1',
    questionText: '아이가 다른 아이와 5분 이상 같이 놉니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 94
  },
  {
    category: 'SOCIAL',
    questionNumber: 32,
    level: 'Q2',
    questionText: '아이가 다른 아이와 2-3분 정도 같이 놉니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 95
  },
  {
    category: 'SOCIAL',
    questionNumber: 32,
    level: 'Q3',
    questionText: '아이가 다른 아이에게 관심을 보입니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 96
  },
  {
    category: 'SOCIAL',
    questionNumber: 33,
    level: 'Q1',
    questionText: '아이가 어른 흉내를 냅니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 97
  },
  {
    category: 'SOCIAL',
    questionNumber: 33,
    level: 'Q2',
    questionText: '아이가 다른 사람이 하는 것을 따라 합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 98
  },
  {
    category: 'SOCIAL',
    questionNumber: 33,
    level: 'Q3',
    questionText: '아이가 어른이 하는 것을 관심 있게 쳐다봅니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 99
  },
  {
    category: 'SOCIAL',
    questionNumber: 34,
    level: 'Q1',
    questionText: '아이가 자기 물건에 집착합니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 100
  },
  {
    category: 'SOCIAL',
    questionNumber: 34,
    level: 'Q2',
    questionText: '아이가 자기 물건을 다른 아이와 함께 사용합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 101
  },
  {
    category: 'SOCIAL',
    questionNumber: 34,
    level: 'Q3',
    questionText: '아이가 자기 물건을 다른 사람에게 주었다가 다시 돌려 받습니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 102
  },
  {
    category: 'SOCIAL',
    questionNumber: 35,
    level: 'Q1',
    questionText: '아이가 대소변을 가립니까?',
    answerType: 'FOUR_POINT',
    isWarning: false,
    order: 103
  },
  {
    category: 'SOCIAL',
    questionNumber: 35,
    level: 'Q2',
    questionText: '아이가 대소변을 미리 표현합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 104
  },
  {
    category: 'SOCIAL',
    questionNumber: 35,
    level: 'Q3',
    questionText: '아이가 대소변 후에 표현합니까?',
    answerType: 'TWO_POINT',
    isWarning: false,
    order: 105
  },

  // 경고 질문 (5문항) - 점수 없음
  {
    category: 'GROSS_MOTOR',
    questionNumber: 36,
    level: 'Q1',
    questionText: '아이의 키가 많이 작습니까?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 106
  },
  {
    category: 'FINE_MOTOR',
    questionNumber: 37,
    level: 'Q1',
    questionText: '아이가 한 손만 주로 사용합니까?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 107
  },
  {
    category: 'LANGUAGE',
    questionNumber: 38,
    level: 'Q1',
    questionText: '아이가 말을 전혀 하지 않습니까?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 108
  },
  {
    category: 'COGNITIVE',
    questionNumber: 39,
    level: 'Q1',
    questionText: '아이가 주변 환경에 관심이 없습니까?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 109
  },
  {
    category: 'SOCIAL',
    questionNumber: 40,
    level: 'Q1',
    questionText: '아이가 다른 사람과 눈을 맞추지 않습니까?',
    answerType: 'TWO_POINT',
    isWarning: true,
    order: 110
  }
]

export async function seedAssessmentQuestions() {
  console.log('Seeding assessment questions...')

  // 27-29개월 기준으로 설정
  const ageMin = 27
  const ageMax = 29

  for (const questionData of assessmentQuestions) {
    await prisma.assessmentQuestion.create({
      data: {
        ...questionData,
        ageMin,
        ageMax
      }
    })
  }

  console.log(`Created ${assessmentQuestions.length} assessment questions for ${ageMin}-${ageMax} months`)
}

export default seedAssessmentQuestions
