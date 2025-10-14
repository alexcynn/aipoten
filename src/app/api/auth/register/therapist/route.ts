import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleDatabaseError } from '@/lib/db-error-handler'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      // Step 1: Basic Info
      email,
      password,
      name,
      gender,
      birthYear,
      phone,
      address,
      addressDetail,

      // Step 2: Professional Info
      specialties,      // array of TherapyType
      childAgeRanges,   // array of age range strings
      serviceAreas,     // array of district names
      sessionFee,

      // Step 3: Certifications & Experience
      certifications,   // array of {name, issuingOrganization, issueDate, filePath}
      experiences,      // array of {employmentType, institutionName, specialty, startDate, endDate, description}
    } = body

    // Validation
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and therapist profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role: 'THERAPIST',
        }
      })

      // 2. Create TherapistProfile
      const therapistProfile = await tx.therapistProfile.create({
        data: {
          userId: user.id,
          gender: gender || null,
          birthYear: birthYear || null,
          address: address || null,
          addressDetail: addressDetail || null,
          specialties: JSON.stringify(specialties || []),
          childAgeRanges: JSON.stringify(childAgeRanges || []),
          serviceAreas: JSON.stringify(serviceAreas || []),
          sessionFee: sessionFee || null,
          approvalStatus: 'PENDING',
          status: 'PENDING',
        }
      })

      // 3. Create Certifications
      if (certifications && certifications.length > 0) {
        await tx.certification.createMany({
          data: certifications.map((cert: any) => ({
            therapistProfileId: therapistProfile.id,
            name: cert.name,
            issuingOrganization: cert.issuingOrganization,
            issueDate: new Date(cert.issueDate),
            filePath: cert.filePath || null,
          }))
        })
      }

      // 4. Create Experiences
      if (experiences && experiences.length > 0) {
        await tx.experience.createMany({
          data: experiences.map((exp: any) => ({
            therapistProfileId: therapistProfile.id,
            employmentType: exp.employmentType,
            institutionName: exp.institutionName || null,
            specialty: exp.specialty,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            description: exp.description || null,
          }))
        })
      }

      return { user, therapistProfile }
    })

    // TODO: Send notifications
    // - Send confirmation email to therapist
    // - Send notification to admin about new application

    console.log(`✅ Therapist registered successfully: ${email} (User ID: ${result.user.id}, Profile ID: ${result.therapistProfile.id})`)

    return NextResponse.json({
      message: '치료사 등록 신청이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.',
      userId: result.user.id,
      profileId: result.therapistProfile.id,
    }, { status: 201 })

  } catch (error) {
    const dbError = handleDatabaseError(error, 'POST /api/auth/register/therapist')
    return NextResponse.json(
      { error: dbError.message, errorCode: dbError.errorCode },
      { status: dbError.statusCode }
    )
  }
}
