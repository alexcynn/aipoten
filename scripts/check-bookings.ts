import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking booking data...\n')

  // 언어 컨설팅 조회
  const consultations = await prisma.booking.findMany({
    where: {
      sessionType: 'CONSULTATION'
    },
    include: {
      parentUser: {
        select: {
          name: true,
          email: true,
        }
      },
      child: {
        select: {
          name: true,
        }
      },
      therapist: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
            }
          }
        }
      }
    }
  })

  console.log(`📋 언어 컨설팅: ${consultations.length}건`)
  consultations.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.parentUser.name} - ${c.child.name} (치료사: ${c.therapist.user.name}) - 상태: ${c.status}`)
  })

  // 홈티 조회
  const therapies = await prisma.booking.findMany({
    where: {
      sessionType: 'THERAPY'
    },
    include: {
      parentUser: {
        select: {
          name: true,
          email: true,
        }
      },
      child: {
        select: {
          name: true,
        }
      },
      therapist: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
            }
          }
        }
      }
    }
  })

  console.log(`\n📋 홈티: ${therapies.length}건`)
  therapies.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.parentUser.name} - ${t.child.name} (치료사: ${t.therapist.user.name}) - 상태: ${t.status} - ${t.completedSessions}/${t.sessionCount}회`)
  })

  console.log(`\n✅ Total bookings: ${consultations.length + therapies.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
