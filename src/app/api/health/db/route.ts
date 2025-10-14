import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logDatabaseError } from '@/lib/db-error-handler'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log('🔍 Health check: Testing database connection...')

    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`

    const duration = Date.now() - startTime

    console.log(`✅ Health check: Database connected successfully (${duration}ms)`)

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      responseTime: `${duration}ms`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ?
        `${process.env.DATABASE_URL.substring(0, 20)}...` :
        'NOT SET',
    }, { status: 200 })

  } catch (error) {
    const duration = Date.now() - startTime

    console.error(`❌ Health check: Database connection failed (${duration}ms)`)
    logDatabaseError(error, 'GET /api/health/db')

    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      responseTime: `${duration}ms`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'Unknown',
    }, { status: 503 })
  }
}
