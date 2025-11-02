import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@test.com'
  const testPassword = 'admin123'

  console.log('Testing admin login...\n')

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
    },
  })

  if (!user) {
    console.error('❌ User not found!')
    return
  }

  console.log('User found:')
  console.log(`  ID: ${user.id}`)
  console.log(`  Email: ${user.email}`)
  console.log(`  Name: ${user.name}`)
  console.log(`  Role: ${user.role}`)
  console.log(`  Password hash exists: ${!!user.password}`)
  console.log(`  Password hash length: ${user.password?.length || 0}`)
  console.log(`  Password hash preview: ${user.password?.substring(0, 20)}...`)

  if (!user.password) {
    console.error('\n❌ No password hash found!')
    return
  }

  console.log(`\nTesting password: "${testPassword}"`)

  try {
    const isValid = await bcrypt.compare(testPassword, user.password)

    if (isValid) {
      console.log('✅ Password is CORRECT!')
    } else {
      console.log('❌ Password is INCORRECT!')

      // Try to hash the test password and compare hashes
      console.log('\nTesting hash generation...')
      const testHash = await bcrypt.hash(testPassword, 10)
      console.log(`  New hash: ${testHash.substring(0, 20)}...`)
      console.log(`  DB hash:  ${user.password.substring(0, 20)}...`)

      const testCompare = await bcrypt.compare(testPassword, testHash)
      console.log(`  Self-test compare: ${testCompare ? '✅ PASS' : '❌ FAIL'}`)
    }
  } catch (error) {
    console.error('❌ Error during password comparison:', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
