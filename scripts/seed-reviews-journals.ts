import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to seed reviews and journals...')

  // Find completed bookings
  const completedBookings = await prisma.booking.findMany({
    where: {
      status: 'COMPLETED',
    },
    include: {
      payment: {
        include: {
          parentUser: true,
        },
      },
      review: true,
    },
  })

  console.log(`Found ${completedBookings.length} completed bookings`)

  let journalsAdded = 0
  let reviewsAdded = 0

  for (const booking of completedBookings) {
    // Add therapist note (journal) if missing
    if (!booking.therapistNote) {
      const sampleJournals = [
        `오늘 세션에서 아이는 집중력이 크게 향상되었습니다. 새로운 언어 활동에 적극적으로 참여하며 긍정적인 반응을 보였습니다. 단어 인식 능력이 향상되고 있으며, 문장 구성에서도 진전이 있습니다. 다음 세션에서는 좀 더 복잡한 문장 구조를 연습할 예정입니다.`,
        `이번 세션에서는 감각 통합 활동을 중심으로 진행했습니다. 아이가 다양한 촉각 자극에 대한 반응이 개선되었으며, 균형 감각도 향상되고 있습니다. 놀이 활동을 통해 사회성 발달도 관찰되었습니다. 보호자께서는 가정에서도 유사한 활동을 지속해주시면 좋겠습니다.`,
        `오늘은 미술 치료 활동으로 진행했습니다. 아이가 색채 선택에서 더 다양한 표현을 시도했으며, 손의 소근육 발달이 눈에 띄게 개선되었습니다. 정서적으로도 안정적인 모습을 보여주었고, 자기 표현 능력이 향상되고 있습니다.`,
        `인지 치료 세션에서 문제 해결 능력이 크게 향상되었습니다. 순차적 사고와 논리적 추론에서 진전이 있으며, 기억력도 개선되고 있습니다. 집중 시간이 늘어났으며, 과제 완수율도 높아졌습니다. 매우 긍정적인 발달 과정을 보이고 있습니다.`,
        `행동 치료 세션에서 아이의 자기 조절 능력이 향상되었습니다. 부정적 행동의 빈도가 감소했으며, 긍정적 행동 강화에 잘 반응하고 있습니다. 사회적 상호작용에서도 개선이 관찰되었습니다. 가정에서의 일관된 행동 관리가 중요합니다.`,
      ]

      const randomJournal = sampleJournals[Math.floor(Math.random() * sampleJournals.length)]

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          therapistNote: randomJournal,
        },
      })

      journalsAdded++
      console.log(`Added journal to booking ${booking.id}`)
    }

    // Add review if missing (ignore date restrictions for test data)
    if (!booking.review) {
        const sampleReviews = [
          { rating: 5, content: '치료사 선생님이 정말 친절하시고 아이를 잘 이해해주셨어요. 아이가 세션을 기다릴 정도로 좋아합니다. 진심으로 감사드립니다!' },
          { rating: 5, content: '전문성이 뛰어나시고 아이의 발달 상태를 정확히 파악해주셨습니다. 매 세션마다 진전이 느껴집니다. 적극 추천합니다.' },
          { rating: 4, content: '전반적으로 만족스러웠습니다. 아이가 편안하게 세션을 받았고, 선생님의 설명도 명확했습니다. 앞으로도 계속 받고 싶어요.' },
          { rating: 5, content: '아이의 변화가 눈에 띕니다. 선생님께서 세심하게 관찰하시고 맞춤형 접근을 해주셔서 효과가 좋았습니다. 정말 감사합니다.' },
          { rating: 4, content: '치료 방식이 체계적이고 좋았습니다. 아이도 즐거워하며 참여했어요. 다만 시간이 조금 짧게 느껴졌습니다.' },
          { rating: 5, content: '최고의 선생님입니다! 아이의 특성을 빠르게 파악하시고 적절한 활동을 제공해주셨어요. 부모 상담도 도움이 많이 되었습니다.' },
          { rating: 3, content: '나쁘지 않았지만 기대했던 것보다는 조금 아쉬웠습니다. 그래도 아이는 좋아했어요.' },
        ]

        const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)]

        await prisma.review.create({
          data: {
            bookingId: booking.id,
            parentUserId: booking.payment.parentUserId,
            rating: randomReview.rating,
            content: randomReview.content,
          },
        })

        reviewsAdded++
        console.log(`Added review (${randomReview.rating} stars) to booking ${booking.id}`)
    }
  }

  console.log(`\nSeeding completed!`)
  console.log(`- Journals added: ${journalsAdded}`)
  console.log(`- Reviews added: ${reviewsAdded}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
