import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userId = 'cmhbztz5j0003l1bwzyopvx7y'

  console.log('김지은 사용자의 치료사 프로필 생성 중...')

  const profile = await prisma.therapistProfile.create({
    data: {
      userId: userId,
      gender: 'FEMALE',
      specialties: JSON.stringify(['SPEECH_THERAPY']),
      childAgeRanges: JSON.stringify(['AGE_0_12', 'AGE_13_24']),
      serviceAreas: JSON.stringify(['강남구', '서초구']),
      sessionFee: 80000,
      isPreTherapist: false,
      approvalStatus: 'APPROVED',
      status: 'APPROVED',
      bank: 'KB국민은행',
      accountNumber: '123-456-789012',
      accountHolder: '김지은',
    }
  })

  console.log('✅ 프로필 생성 완료!')
  console.log(profile)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
