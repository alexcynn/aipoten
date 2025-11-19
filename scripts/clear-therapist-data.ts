import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearTherapistData() {
  console.log('치료사 관련 데이터 초기화 시작...\n')

  try {
    // 1. Review 삭제 (Booking에 종속)
    const reviewCount = await prisma.review.deleteMany({})
    console.log(`✓ Review 삭제: ${reviewCount.count}건`)

    // 2. RefundRequest 삭제 (Payment에 종속)
    const refundCount = await prisma.refundRequest.deleteMany({})
    console.log(`✓ RefundRequest 삭제: ${refundCount.count}건`)

    // 3. Booking 삭제 (Payment, TimeSlot, TherapistProfile에 종속)
    const bookingCount = await prisma.booking.deleteMany({})
    console.log(`✓ Booking 삭제: ${bookingCount.count}건`)

    // 4. Payment 삭제 (TherapistProfile에 종속)
    const paymentCount = await prisma.payment.deleteMany({})
    console.log(`✓ Payment 삭제: ${paymentCount.count}건`)

    // 5. TimeSlot 삭제 (TherapistProfile에 종속)
    const timeSlotCount = await prisma.timeSlot.deleteMany({})
    console.log(`✓ TimeSlot 삭제: ${timeSlotCount.count}건`)

    // 6. MatchingRequest 삭제 (TherapistProfile에 종속)
    const matchingCount = await prisma.matchingRequest.deleteMany({})
    console.log(`✓ MatchingRequest 삭제: ${matchingCount.count}건`)

    // 7. ProfileUpdateRequest 삭제 (TherapistProfile에 종속)
    const profileUpdateCount = await prisma.profileUpdateRequest.deleteMany({})
    console.log(`✓ ProfileUpdateRequest 삭제: ${profileUpdateCount.count}건`)

    // 8. Education 삭제 (TherapistProfile에 종속)
    const educationCount = await prisma.education.deleteMany({})
    console.log(`✓ Education 삭제: ${educationCount.count}건`)

    // 9. Experience 삭제 (TherapistProfile에 종속)
    const experienceCount = await prisma.experience.deleteMany({})
    console.log(`✓ Experience 삭제: ${experienceCount.count}건`)

    // 10. Certification 삭제 (TherapistProfile에 종속)
    const certificationCount = await prisma.certification.deleteMany({})
    console.log(`✓ Certification 삭제: ${certificationCount.count}건`)

    // 11. TherapistAvailability 삭제 (TherapistProfile에 종속)
    const availabilityCount = await prisma.therapistAvailability.deleteMany({})
    console.log(`✓ TherapistAvailability 삭제: ${availabilityCount.count}건`)

    // 12. HolidayDate 삭제 (치료사 휴일)
    const holidayCount = await prisma.holidayDate.deleteMany({})
    console.log(`✓ HolidayDate 삭제: ${holidayCount.count}건`)

    // 13. TherapistProfile 삭제 (User에 종속)
    const therapistCount = await prisma.therapistProfile.deleteMany({})
    console.log(`✓ TherapistProfile 삭제: ${therapistCount.count}건`)

    // 14. THERAPIST 역할 사용자를 PARENT로 변경 (선택적)
    const userUpdateCount = await prisma.user.updateMany({
      where: { role: 'THERAPIST' },
      data: { role: 'PARENT' }
    })
    console.log(`✓ THERAPIST 역할 사용자 → PARENT로 변경: ${userUpdateCount.count}건`)

    console.log('\n✅ 치료사 관련 데이터 초기화 완료!')

  } catch (error) {
    console.error('❌ 데이터 초기화 중 오류 발생:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearTherapistData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
