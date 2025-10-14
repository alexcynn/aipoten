import { PrismaClientKnownRequestError, PrismaClientInitializationError, PrismaClientRustPanicError } from '@prisma/client/runtime/library'

interface DbErrorLog {
  timestamp: string
  errorType: string
  message: string
  code?: string
  meta?: any
  stack?: string
}

export function logDatabaseError(error: any, context: string): DbErrorLog {
  const timestamp = new Date().toISOString()
  const errorLog: DbErrorLog = {
    timestamp,
    errorType: 'Unknown',
    message: error.message || 'Unknown error',
  }

  console.error('='.repeat(80))
  console.error(`🚨 DATABASE ERROR in ${context}`)
  console.error('Timestamp:', timestamp)
  console.error('='.repeat(80))

  // Prisma Client Known Request Error (P2xxx codes)
  if (error instanceof PrismaClientKnownRequestError) {
    errorLog.errorType = 'PrismaClientKnownRequestError'
    errorLog.code = error.code
    errorLog.meta = error.meta

    console.error('Error Type: Prisma Known Request Error')
    console.error('Error Code:', error.code)
    console.error('Error Message:', error.message)
    console.error('Meta:', error.meta)

    // 일반적인 Prisma 에러 코드 설명
    switch (error.code) {
      case 'P2000':
        console.error('💡 Diagnosis: Value too long for column')
        break
      case 'P2001':
        console.error('💡 Diagnosis: Record not found')
        break
      case 'P2002':
        console.error('💡 Diagnosis: Unique constraint violation')
        console.error('   Conflicting field(s):', error.meta?.target)
        break
      case 'P2003':
        console.error('💡 Diagnosis: Foreign key constraint failed')
        break
      case 'P2004':
        console.error('💡 Diagnosis: Constraint failed on database')
        break
      case 'P2005':
        console.error('💡 Diagnosis: Invalid value stored in database')
        break
      case 'P2006':
        console.error('💡 Diagnosis: Invalid value provided')
        break
      case 'P2007':
        console.error('💡 Diagnosis: Data validation error')
        break
      case 'P2008':
        console.error('💡 Diagnosis: Failed to parse query')
        break
      case 'P2009':
        console.error('💡 Diagnosis: Failed to validate query')
        break
      case 'P2010':
        console.error('💡 Diagnosis: Raw query failed')
        break
      case 'P2011':
        console.error('💡 Diagnosis: Null constraint violation')
        break
      case 'P2012':
        console.error('💡 Diagnosis: Missing required value')
        break
      case 'P2013':
        console.error('💡 Diagnosis: Missing required argument')
        break
      case 'P2014':
        console.error('💡 Diagnosis: Required relation violation')
        break
      case 'P2015':
        console.error('💡 Diagnosis: Related record not found')
        break
      case 'P2016':
        console.error('💡 Diagnosis: Query interpretation error')
        break
      case 'P2017':
        console.error('💡 Diagnosis: Records for relation not connected')
        break
      case 'P2018':
        console.error('💡 Diagnosis: Required connected records not found')
        break
      case 'P2019':
        console.error('💡 Diagnosis: Input error')
        break
      case 'P2020':
        console.error('💡 Diagnosis: Value out of range')
        break
      case 'P2021':
        console.error('💡 Diagnosis: Table does not exist')
        break
      case 'P2022':
        console.error('💡 Diagnosis: Column does not exist')
        break
      case 'P2023':
        console.error('💡 Diagnosis: Inconsistent column data')
        break
      case 'P2024':
        console.error('💡 Diagnosis: Connection pool timeout')
        break
      case 'P2025':
        console.error('💡 Diagnosis: Record to delete not found')
        break
      case 'P2026':
        console.error('💡 Diagnosis: Database operation not supported')
        break
      case 'P2027':
        console.error('💡 Diagnosis: Multiple database errors')
        break
      default:
        console.error('💡 Unknown Prisma error code')
    }
  }
  // Prisma Client Initialization Error (connection issues)
  else if (error instanceof PrismaClientInitializationError) {
    errorLog.errorType = 'PrismaClientInitializationError'
    errorLog.code = error.errorCode

    console.error('Error Type: Prisma Initialization Error')
    console.error('Error Code:', error.errorCode)
    console.error('Error Message:', error.message)

    console.error('💡 Diagnosis: Failed to initialize Prisma Client')
    console.error('   Common causes:')
    console.error('   - Invalid DATABASE_URL')
    console.error('   - Database server not accessible')
    console.error('   - Network/firewall blocking connection')
    console.error('   - Wrong database credentials')
    console.error('   - Database not created yet')
  }
  // Prisma Client Rust Panic Error (critical internal error)
  else if (error instanceof PrismaClientRustPanicError) {
    errorLog.errorType = 'PrismaClientRustPanicError'

    console.error('Error Type: Prisma Rust Panic Error')
    console.error('Error Message:', error.message)
    console.error('💡 Diagnosis: Critical internal error in Prisma')
    console.error('   This is a serious issue - check Prisma version and report bug')
  }
  // Generic errors
  else {
    errorLog.errorType = error.name || 'GenericError'

    console.error('Error Type:', error.name || 'Generic Error')
    console.error('Error Message:', error.message)

    // Check for common database connection strings
    if (error.message?.includes('ECONNREFUSED')) {
      console.error('💡 Diagnosis: Connection refused - database server not running')
    } else if (error.message?.includes('ENOTFOUND')) {
      console.error('💡 Diagnosis: Host not found - check DATABASE_URL hostname')
    } else if (error.message?.includes('ETIMEDOUT')) {
      console.error('💡 Diagnosis: Connection timeout - check network/firewall')
    } else if (error.message?.includes('authentication')) {
      console.error('💡 Diagnosis: Authentication failed - check credentials')
    }
  }

  // Stack trace (in development only)
  if (process.env.NODE_ENV !== 'production' && error.stack) {
    errorLog.stack = error.stack
    console.error('Stack trace:')
    console.error(error.stack)
  }

  console.error('='.repeat(80))

  return errorLog
}

export function handleDatabaseError(error: any, context: string): {
  message: string
  statusCode: number
  errorCode?: string
} {
  logDatabaseError(error, context)

  // Prisma Client Known Request Error
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          message: '이미 존재하는 데이터입니다.',
          statusCode: 409,
          errorCode: error.code,
        }
      case 'P2025':
        return {
          message: '요청한 데이터를 찾을 수 없습니다.',
          statusCode: 404,
          errorCode: error.code,
        }
      case 'P2003':
        return {
          message: '관련된 데이터가 유효하지 않습니다.',
          statusCode: 400,
          errorCode: error.code,
        }
      case 'P2024':
        return {
          message: '데이터베이스 연결 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
          statusCode: 503,
          errorCode: error.code,
        }
      default:
        return {
          message: '데이터베이스 오류가 발생했습니다.',
          statusCode: 500,
          errorCode: error.code,
        }
    }
  }

  // Prisma Client Initialization Error
  if (error instanceof PrismaClientInitializationError) {
    return {
      message: '데이터베이스 연결에 실패했습니다. 관리자에게 문의해주세요.',
      statusCode: 503,
      errorCode: error.errorCode,
    }
  }

  // Generic database errors
  return {
    message: '서버 오류가 발생했습니다.',
    statusCode: 500,
  }
}
