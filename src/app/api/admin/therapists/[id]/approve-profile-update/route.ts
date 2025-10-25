import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const resolvedParams = await params

    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { id: resolvedParams.id },
      include: {
        user: true
      }
    })

    if (!therapistProfile) {
      return NextResponse.json(
        { error: '치료사 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (!therapistProfile.profileUpdateRequested) {
      return NextResponse.json(
        { error: '프로필 수정 요청이 없습니다.' },
        { status: 400 }
      )
    }

    // Find pending profile update request
    const updateRequest = await prisma.profileUpdateRequest.findFirst({
      where: {
        therapistProfileId: resolvedParams.id,
        status: 'PENDING',
      },
    })

    if (!updateRequest) {
      return NextResponse.json(
        { error: '수정 요청 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Parse request data
    const requestData = JSON.parse(updateRequest.requestData)

    // Delete existing certifications, experiences, and educations
    await prisma.certification.deleteMany({
      where: { therapistProfileId: resolvedParams.id },
    })
    await prisma.experience.deleteMany({
      where: { therapistProfileId: resolvedParams.id },
    })
    await prisma.education.deleteMany({
      where: { therapistProfileId: resolvedParams.id },
    })

    // Apply changes to therapist profile with user update
    const updatedProfile = await prisma.therapistProfile.update({
      where: { id: resolvedParams.id },
      data: {
        gender: requestData.gender || null,
        birthYear: requestData.birthYear || null,
        address: requestData.address || null,
        addressDetail: requestData.addressDetail || null,
        specialties: JSON.stringify(requestData.specialties || []),
        childAgeRanges: JSON.stringify(requestData.childAgeRanges || []),
        serviceAreas: JSON.stringify(requestData.serviceAreas || []),
        sessionFee: requestData.sessionFee || null,
        bank: requestData.bank || null,
        accountNumber: requestData.accountNumber || null,
        accountHolder: requestData.accountHolder || null,
        isPreTherapist: requestData.isPreTherapist || false,
        profileUpdateRequested: false,
        profileUpdateApprovedAt: new Date(),
        profileUpdateApprovedBy: session.user.id,
        profileUpdateNote: null,
        user: {
          update: {
            name: requestData.name,
            phone: requestData.phone || null,
          },
        },
      },
    })

    // Create new certifications
    if (requestData.certifications && requestData.certifications.length > 0) {
      await prisma.certification.createMany({
        data: requestData.certifications.map((cert: any) => ({
          therapistProfileId: resolvedParams.id,
          name: cert.name,
          issuingOrganization: cert.issuingOrganization,
          issueDate: new Date(cert.issueDate),
          filePath: cert.filePath || null,
        })),
      })
    }

    // Create new experiences
    if (requestData.experiences && requestData.experiences.length > 0) {
      await prisma.experience.createMany({
        data: requestData.experiences.map((exp: any) => ({
          therapistProfileId: resolvedParams.id,
          employmentType: exp.employmentType,
          institutionName: exp.institutionName || null,
          specialty: exp.specialty,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          description: exp.description || null,
        })),
      })
    }

    // Create new educations
    if (requestData.educations && requestData.educations.length > 0) {
      await prisma.education.createMany({
        data: requestData.educations.map((edu: any) => ({
          therapistProfileId: resolvedParams.id,
          degree: edu.degree,
          school: edu.school,
          major: edu.major,
          graduationYear: edu.graduationYear,
        })),
      })
    }

    // Update request status
    await prisma.profileUpdateRequest.update({
      where: { id: updateRequest.id },
      data: {
        status: 'APPROVED',
        processedAt: new Date(),
        processedBy: session.user.id,
      },
    })

    // TODO: Send notifications
    // - Send approval email to therapist
    // - Send SMS notification

    return NextResponse.json({
      message: '프로필 수정 요청이 승인되었습니다.',
      therapistProfile: updatedProfile
    })

  } catch (error) {
    console.error('프로필 수정 승인 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
