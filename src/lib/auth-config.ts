import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] Starting authorization...')
        console.log('🔐 [AUTH] Email:', credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH] Missing credentials')
          return null
        }

        console.log('🔍 [AUTH] Looking up user...')
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            therapistProfile: true
          }
        })

        if (!user || !user.password) {
          console.log('❌ [AUTH] User not found or no password')
          return null
        }

        console.log('✅ [AUTH] User found:', user.email, user.role)
        console.log('🔑 [AUTH] Comparing passwords...')

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          console.log('❌ [AUTH] Password mismatch')
          return null
        }

        console.log('✅ [AUTH] Password valid')

        // 치료사인 경우 승인 상태 확인
        if (user.role === 'THERAPIST' && user.therapistProfile) {
          const approvalStatus = user.therapistProfile.approvalStatus

          // PENDING, WAITING, APPROVED 상태만 로그인 허용 (거절된 경우만 차단)
          if (approvalStatus === 'REJECTED') {
            throw new Error('계정이 거절되었습니다. 관리자에게 문의해주세요.')
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as any
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  }
}