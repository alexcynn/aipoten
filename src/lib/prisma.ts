import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// DB 연결 정보 로깅
console.log('=== Prisma Database Configuration ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('DATABASE_URL preview:', process.env.DATABASE_URL ?
  `${process.env.DATABASE_URL.substring(0, 20)}...${process.env.DATABASE_URL.slice(-20)}` :
  'NOT SET'
)
console.log('=====================================')

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
    errorFormat: 'pretty',
  })

// Query 로깅 (개발 환경에서만)
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query' as never, (e: any) => {
    console.log('Query: ' + e.query)
    console.log('Duration: ' + e.duration + 'ms')
  })
}

// 연결 테스트 및 에러 핸들링
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully')
  })
  .catch((error) => {
    console.error('❌ Database connection failed:')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)

    // 일반적인 연결 오류 원인 진단
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Diagnosis: Database server is not running or refusing connections')
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Diagnosis: Database host not found. Check DATABASE_URL hostname')
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Diagnosis: Invalid database credentials. Check username/password in DATABASE_URL')
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('💡 Diagnosis: Database does not exist. Run migrations or create database')
    } else if (error.message.includes('timeout')) {
      console.error('💡 Diagnosis: Connection timeout. Check network/firewall settings')
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma