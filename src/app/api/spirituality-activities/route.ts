import { NextResponse } from 'next/server'

// 놀이 영성 활동 데이터
const spiritualityActivities = [
  {
    id: '1',
    title: '감사 일기 그리기',
    description: '오늘 하루 동안 감사했던 일들을 그림으로 표현해보는 활동입니다.',
    instructions: [
      '아이와 함께 오늘 하루를 돌아보며 이야기해보세요',
      '감사했던 일이나 좋았던 일을 3가지 정도 찾아보세요',
      '각각을 그림으로 그려보거나 스티커로 표현해보세요',
      '그림을 다 그린 후 왜 감사한지 이야기해보세요',
      '완성된 그림을 냉장고에 붙이거나 특별한 곳에 보관해주세요'
    ],
    materials: ['종이', '크레용', '색연필', '스티커'],
    ageMin: 24,
    ageMax: 72,
    category: '감사하기',
    duration: 20,
    difficulty: 'easy' as const,
    spiritualAspect: '일상의 작은 것들에 감사하는 마음을 기르고, 긍정적인 시각으로 하루를 돌아보는 습관을 만듭니다.',
    benefits: ['감사하는 마음', '긍정적 사고', '자기 표현력', '추억 만들기']
  },
  {
    id: '2',
    title: '나눔 상자 만들기',
    description: '가정에서 사용하지 않는 장난감이나 물건을 모아 다른 사람과 나누는 활동입니다.',
    instructions: [
      '예쁜 상자를 준비하고 아이와 함께 꾸며보세요',
      '집안을 돌아다니며 더 이상 사용하지 않는 장난감을 찾아보세요',
      '각 물건에 대해 좋은 추억을 이야기해보세요',
      '깨끗하게 정리해서 나눔 상자에 담아보세요',
      '어려운 이웃이나 기관에 전달하는 과정을 함께 경험해보세요'
    ],
    materials: ['상자', '포장지', '리본', '스티커', '매직'],
    ageMin: 30,
    ageMax: 84,
    category: '나눔과 배려',
    duration: 40,
    difficulty: 'medium' as const,
    spiritualAspect: '나눔의 기쁨을 경험하고, 다른 사람을 생각하는 배려하는 마음을 기릅니다.',
    benefits: ['나눔의 기쁨', '배려심', '사회적 책임감', '정리 정돈']
  },
  {
    id: '3',
    title: '자연 보물찾기',
    description: '자연 속에서 다양한 보물들을 찾으며 자연의 소중함을 느끼는 활동입니다.',
    instructions: [
      '공원이나 산책로에서 자연 보물찾기를 시작해보세요',
      '예쁜 나뭇잎, 돌멩이, 꽃잎 등을 찾아 수집해보세요',
      '각 보물의 특징과 아름다운 점을 함께 관찰해보세요',
      '수집한 자연물로 작은 작품을 만들어보세요',
      '자연을 보호하는 방법에 대해 이야기해보세요'
    ],
    materials: ['수집 가방', '돋보기', '작은 바구니', '습자지'],
    ageMin: 18,
    ageMax: 60,
    category: '자연과 친해지기',
    duration: 30,
    difficulty: 'easy' as const,
    spiritualAspect: '자연의 아름다움을 발견하고, 자연에 대한 경외심과 보호 의식을 기릅니다.',
    benefits: ['자연 친화력', '관찰력', '호기심', '환경 의식']
  },
  {
    id: '4',
    title: '마음 진정 시간',
    description: '깊게 숨쉬기와 간단한 명상을 통해 마음을 진정시키는 활동입니다.',
    instructions: [
      '조용하고 편안한 곳에 앉아주세요',
      '아이와 함께 천천히 깊게 숨을 쉬어보세요',
      '코로 숨을 들이마시고 입으로 천천히 내쉬어보세요',
      '좋은 기억이나 행복한 순간을 떠올려보세요',
      '마음이 평온해지는 느낌을 함께 나누어보세요'
    ],
    materials: ['쿠션', '담요', '부드러운 음악'],
    ageMin: 36,
    ageMax: 96,
    category: '마음 다스리기',
    duration: 15,
    difficulty: 'medium' as const,
    spiritualAspect: '내면의 평화를 찾고, 감정을 조절하는 능력을 기릅니다.',
    benefits: ['정서 안정', '집중력', '자기 조절', '스트레스 해소']
  },
  {
    id: '5',
    title: '기도하는 시간',
    description: '하루의 시작이나 마무리에 짧은 기도나 소망을 나누는 활동입니다.',
    instructions: [
      '하루 중 조용한 시간을 정해보세요',
      '가족이 함께 모여 손을 잡아보세요',
      '오늘 있었던 좋은 일에 대해 감사 인사를 해보세요',
      '내일에 대한 좋은 소망을 이야기해보세요',
      '서로를 위한 따뜻한 마음을 나누어보세요'
    ],
    materials: ['촛불(선택사항)', '조용한 음악'],
    ageMin: 24,
    ageMax: 120,
    category: '기도와 명상',
    duration: 10,
    difficulty: 'easy' as const,
    spiritualAspect: '감사하는 마음과 희망을 품는 시간을 통해 영적 성장을 도모합니다.',
    benefits: ['영적 성장', '가족 유대감', '감사하는 마음', '내적 평화']
  },
  {
    id: '6',
    title: '사랑 편지 쓰기',
    description: '가족이나 친구에게 사랑과 고마움을 전하는 편지를 써보는 활동입니다.',
    instructions: [
      '예쁜 편지지와 색연필을 준비해주세요',
      '누구에게 편지를 쓸지 함께 정해보세요',
      '그 사람에 대한 좋은 기억을 이야기해보세요',
      '고마운 마음이나 사랑하는 마음을 그림과 글로 표현해보세요',
      '완성한 편지를 직접 전달하거나 우편으로 보내보세요'
    ],
    materials: ['편지지', '색연필', '스티커', '봉투', '우표'],
    ageMin: 36,
    ageMax: 84,
    category: '사랑 표현하기',
    duration: 25,
    difficulty: 'medium' as const,
    spiritualAspect: '사랑을 표현하는 방법을 배우고, 인간관계의 소중함을 깨닫습니다.',
    benefits: ['사랑 표현', '글쓰기 능력', '인간관계', '감정 표현']
  },
  {
    id: '7',
    title: '화해하기 놀이',
    description: '친구나 가족과 다툰 후 화해하는 방법을 배우는 역할놀이 활동입니다.',
    instructions: [
      '인형이나 역할놀이를 통해 갈등 상황을 만들어보세요',
      '각자의 마음이 어땠는지 이야기해보세요',
      '미안한 마음을 어떻게 표현할지 연습해보세요',
      '용서하는 마음의 중요성에 대해 이야기해보세요',
      '화해 후의 기쁜 마음을 함께 표현해보세요'
    ],
    materials: ['인형', '소품', '거울'],
    ageMin: 30,
    ageMax: 72,
    category: '용서와 화해',
    duration: 20,
    difficulty: 'medium' as const,
    spiritualAspect: '용서의 힘과 화해의 기쁨을 경험하며, 관계 회복의 소중함을 배웁니다.',
    benefits: ['갈등 해결', '공감 능력', '용서하는 마음', '소통 능력']
  },
  {
    id: '8',
    title: '경청하기 게임',
    description: '상대방의 이야기를 잘 들어주는 경청의 중요성을 배우는 활동입니다.',
    instructions: [
      '마주 앉아서 번갈아가며 이야기하는 시간을 가져보세요',
      '한 사람이 말할 때 다른 사람은 끝까지 들어주기로 약속해보세요',
      '들은 이야기를 다시 말해보는 게임을 해보세요',
      '이야기를 들으며 어떤 기분이었는지 나누어보세요',
      '잘 들어준 것에 대해 고마움을 표현해보세요'
    ],
    materials: ['타이머', '이야기 주제 카드(선택사항)'],
    ageMin: 42,
    ageMax: 96,
    category: '경청하기',
    duration: 15,
    difficulty: 'easy' as const,
    spiritualAspect: '다른 사람의 마음에 귀 기울이는 능력을 기르고, 진정한 소통의 의미를 배웁니다.',
    benefits: ['경청 능력', '소통 기술', '집중력', '공감 능력']
  },
  {
    id: '9',
    title: '창작 이야기 만들기',
    description: '상상력을 발휘해 의미 있는 이야기를 함께 만들어보는 활동입니다.',
    instructions: [
      '주인공과 배경을 함께 정해보세요',
      '주인공이 겪을 모험이나 상황을 상상해보세요',
      '친절함이나 용기 같은 좋은 가치가 담긴 이야기로 만들어보세요',
      '번갈아가며 이야기를 이어가보세요',
      '완성된 이야기를 그림으로 그려보거나 연극으로 표현해보세요'
    ],
    materials: ['종이', '색연필', '소품(선택사항)'],
    ageMin: 36,
    ageMax: 84,
    category: '창조성 기르기',
    duration: 35,
    difficulty: 'hard' as const,
    spiritualAspect: '창조의 기쁨을 경험하고, 좋은 가치를 담은 이야기를 통해 인성을 기릅니다.',
    benefits: ['창의력', '상상력', '언어 능력', '가치관 형성']
  },
  {
    id: '10',
    title: '별 관찰하며 소원 빌기',
    description: '밤하늘의 별을 보며 소원을 빌고 우주의 신비로움을 느끼는 활동입니다.',
    instructions: [
      '맑은 밤에 함께 밖으로 나가보세요',
      '담요를 깔고 누워서 밤하늘을 바라보세요',
      '별자리나 밝은 별들을 함께 찾아보세요',
      '각자 마음속 소원을 별에게 빌어보세요',
      '우주의 크기와 신비로움에 대해 이야기해보세요'
    ],
    materials: ['담요', '손전등', '별자리 책(선택사항)'],
    ageMin: 48,
    ageMax: 120,
    category: '자연과 친해지기',
    duration: 30,
    difficulty: 'easy' as const,
    spiritualAspect: '우주의 신비로움을 통해 경외감을 느끼고, 꿈과 희망을 품는 마음을 기릅니다.',
    benefits: ['경외감', '꿈과 희망', '자연 관찰', '호기심']
  }
]

export async function GET() {
  try {
    return NextResponse.json(spiritualityActivities)
  } catch (error) {
    console.error('놀이 영성 활동 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}