import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleVideos = [
  // 대근육 발달 영상 (0-12개월)
  {
    title: '신생아를 위한 배밀이 놀이',
    description: '아기의 대근육 발달을 돕는 배밀이 놀이 방법을 소개합니다. 목을 가누고 배를 들어올리는 연습을 통해 근육을 강화합니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example1/mqdefault.jpg',
    duration: 300,
    targetAgeMin: 0,
    targetAgeMax: 6,
    difficulty: 'EASY',
    developmentCategories: JSON.stringify(['GROSS_MOTOR']),
    recommendedForLevels: JSON.stringify(['NEEDS_ATTENTION', 'CAUTION']),
    priority: 9,
    isPublished: true
  },
  {
    title: '아기와 함께하는 공놀이',
    description: '6-12개월 아기를 위한 공놀이입니다. 공을 잡고 던지는 동작을 통해 대근육과 눈-손 협응력을 키웁니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example2/mqdefault.jpg',
    duration: 420,
    targetAgeMin: 6,
    targetAgeMax: 12,
    difficulty: 'MEDIUM',
    developmentCategories: JSON.stringify(['GROSS_MOTOR', 'FINE_MOTOR']),
    recommendedForLevels: JSON.stringify(['CAUTION', 'GOOD']),
    priority: 8,
    isPublished: true
  },

  // 소근육 발달 영상
  {
    title: '손가락 놀이와 촉감 놀이',
    description: '다양한 촉감의 재료를 이용한 손가락 놀이입니다. 아기의 소근육 발달과 감각 자극에 도움이 됩니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example3',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example3/mqdefault.jpg',
    duration: 360,
    targetAgeMin: 3,
    targetAgeMax: 12,
    difficulty: 'EASY',
    developmentCategories: JSON.stringify(['FINE_MOTOR', 'COGNITIVE']),
    recommendedForLevels: JSON.stringify(['NEEDS_ATTENTION', 'CAUTION']),
    priority: 9,
    isPublished: true
  },
  {
    title: '블록 쌓기와 모양 맞추기',
    description: '블록을 쌓고 모양을 맞추는 놀이를 통해 소근육과 인지 능력을 발달시킵니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example4',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example4/mqdefault.jpg',
    duration: 480,
    targetAgeMin: 12,
    targetAgeMax: 24,
    difficulty: 'MEDIUM',
    developmentCategories: JSON.stringify(['FINE_MOTOR', 'COGNITIVE']),
    recommendedForLevels: JSON.stringify(['CAUTION', 'GOOD']),
    priority: 7,
    isPublished: true
  },

  // 언어 발달 영상
  {
    title: '아기를 위한 동요와 손유희',
    description: '리듬감 있는 동요와 손유희를 통해 언어 발달을 촉진합니다. 따라 부르며 언어 감각을 키워보세요.',
    videoUrl: 'https://www.youtube.com/watch?v=example5',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example5/mqdefault.jpg',
    duration: 600,
    targetAgeMin: 6,
    targetAgeMax: 18,
    difficulty: 'EASY',
    developmentCategories: JSON.stringify(['LANGUAGE', 'SOCIAL']),
    recommendedForLevels: JSON.stringify(['NEEDS_ATTENTION', 'CAUTION']),
    priority: 10,
    isPublished: true
  },
  {
    title: '그림책 읽어주기 - 의성어 의태어',
    description: '다양한 의성어와 의태어가 포함된 그림책을 읽어주는 영상입니다. 언어 표현력을 키웁니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example6',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example6/mqdefault.jpg',
    duration: 540,
    targetAgeMin: 12,
    targetAgeMax: 36,
    difficulty: 'MEDIUM',
    developmentCategories: JSON.stringify(['LANGUAGE', 'COGNITIVE']),
    recommendedForLevels: JSON.stringify(['ALL']),
    priority: 8,
    isPublished: true
  },

  // 인지 발달 영상
  {
    title: '색깔과 모양 인지 놀이',
    description: '다양한 색깔과 모양을 구분하는 놀이입니다. 시각적 인지 능력을 발달시킵니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example7',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example7/mqdefault.jpg',
    duration: 420,
    targetAgeMin: 12,
    targetAgeMax: 24,
    difficulty: 'EASY',
    developmentCategories: JSON.stringify(['COGNITIVE']),
    recommendedForLevels: JSON.stringify(['NEEDS_ATTENTION', 'CAUTION']),
    priority: 9,
    isPublished: true
  },
  {
    title: '숨바꼭질과 까꿍 놀이',
    description: '물체의 영속성 개념을 배우는 놀이입니다. 인지 발달의 기초를 다집니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example8',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example8/mqdefault.jpg',
    duration: 300,
    targetAgeMin: 6,
    targetAgeMax: 18,
    difficulty: 'EASY',
    developmentCategories: JSON.stringify(['COGNITIVE', 'SOCIAL']),
    recommendedForLevels: JSON.stringify(['ALL']),
    priority: 8,
    isPublished: true
  },

  // 사회성 발달 영상
  {
    title: '엄마 아빠와 함께하는 놀이',
    description: '부모와 상호작용하며 사회성을 기르는 놀이입니다. 애착 형성에도 도움이 됩니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example9',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example9/mqdefault.jpg',
    duration: 480,
    targetAgeMin: 3,
    targetAgeMax: 12,
    difficulty: 'EASY',
    developmentCategories: JSON.stringify(['SOCIAL', 'EMOTIONAL']),
    recommendedForLevels: JSON.stringify(['NEEDS_ATTENTION', 'CAUTION']),
    priority: 9,
    isPublished: true
  },
  {
    title: '친구와 함께 노는 법',
    description: '또래 친구들과 함께 놀이하는 방법을 배웁니다. 나누기와 차례 지키기를 연습합니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example10',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example10/mqdefault.jpg',
    duration: 540,
    targetAgeMin: 18,
    targetAgeMax: 36,
    difficulty: 'MEDIUM',
    developmentCategories: JSON.stringify(['SOCIAL']),
    recommendedForLevels: JSON.stringify(['CAUTION', 'GOOD']),
    priority: 7,
    isPublished: true
  },

  // 정서 발달 영상
  {
    title: '감정 표현 배우기',
    description: '기쁨, 슬픔, 화남 등 다양한 감정을 표현하고 인식하는 방법을 배웁니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example11',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example11/mqdefault.jpg',
    duration: 360,
    targetAgeMin: 12,
    targetAgeMax: 36,
    difficulty: 'MEDIUM',
    developmentCategories: JSON.stringify(['EMOTIONAL', 'SOCIAL']),
    recommendedForLevels: JSON.stringify(['NEEDS_ATTENTION', 'CAUTION']),
    priority: 8,
    isPublished: true
  },
  {
    title: '마음 진정하기 명상',
    description: '아이와 함께하는 간단한 호흡 명상입니다. 정서적 안정과 자기 조절 능력을 키웁니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example12',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example12/mqdefault.jpg',
    duration: 240,
    targetAgeMin: 24,
    targetAgeMax: 48,
    difficulty: 'EASY',
    developmentCategories: JSON.stringify(['EMOTIONAL']),
    recommendedForLevels: JSON.stringify(['ALL']),
    priority: 7,
    isPublished: true
  },

  // 통합 발달 영상
  {
    title: '감각 통합 놀이 - 오감 자극',
    description: '시각, 청각, 촉각, 후각, 미각을 모두 자극하는 통합 놀이입니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example13',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example13/mqdefault.jpg',
    duration: 600,
    targetAgeMin: 6,
    targetAgeMax: 24,
    difficulty: 'MEDIUM',
    developmentCategories: JSON.stringify(['COGNITIVE', 'FINE_MOTOR', 'GROSS_MOTOR']),
    recommendedForLevels: JSON.stringify(['ALL']),
    priority: 9,
    isPublished: true
  },
  {
    title: '음악과 함께하는 율동',
    description: '음악에 맞춰 몸을 움직이며 대근육, 언어, 사회성을 동시에 발달시킵니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example14',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example14/mqdefault.jpg',
    duration: 480,
    targetAgeMin: 12,
    targetAgeMax: 36,
    difficulty: 'EASY',
    developmentCategories: JSON.stringify(['GROSS_MOTOR', 'LANGUAGE', 'SOCIAL']),
    recommendedForLevels: JSON.stringify(['GOOD', 'EXCELLENT']),
    priority: 8,
    isPublished: true
  },
  {
    title: '야외 활동 - 자연과 함께',
    description: '야외에서 자연을 탐험하며 다양한 발달 영역을 자극하는 활동입니다.',
    videoUrl: 'https://www.youtube.com/watch?v=example15',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: 'https://img.youtube.com/vi/example15/mqdefault.jpg',
    duration: 720,
    targetAgeMin: 18,
    targetAgeMax: 48,
    difficulty: 'MEDIUM',
    developmentCategories: JSON.stringify(['GROSS_MOTOR', 'COGNITIVE', 'EMOTIONAL']),
    recommendedForLevels: JSON.stringify(['ALL']),
    priority: 7,
    isPublished: true
  }
]

async function main() {
  console.log('샘플 영상 데이터를 생성합니다...')

  for (const video of sampleVideos) {
    await prisma.video.create({
      data: video
    })
    console.log(`✓ "${video.title}" 생성 완료`)
  }

  console.log(`\n총 ${sampleVideos.length}개의 영상 데이터가 생성되었습니다.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
