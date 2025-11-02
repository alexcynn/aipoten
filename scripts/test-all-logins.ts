import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const testAccounts = [
  { email: 'admin@test.com', password: 'test123!', role: 'ADMIN' },
  { email: 'parent@test.com', password: 'test123!', role: 'PARENT' },
  { email: 'jieun.kim@therapist.com', password: 'password123', role: 'THERAPIST' },
]

async function main() {
  console.log('Testing all login credentials...\n')

  for (const account of testAccounts) {
    console.log(`\n📧 Testing ${account.email} (${account.role})`)
    console.log(`   Password: "${account.password}"`)

    const user = await prisma.user.findUnique({
      where: { email: account.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    })

    if (!user) {
      console.log('   ❌ User not found in database!')
      continue
    }

    console.log(`   ✅ User found: ${user.name}`)
    console.log(`   📝 Role: ${user.role}`)

    if (!user.password) {
      console.log('   ❌ No password hash in database!')
      continue
    }

    console.log(`   🔑 Password hash exists (${user.password.length} chars)`)

    try {
      const isValid = await bcrypt.compare(account.password, user.password)

      if (isValid) {
        console.log('   ✅ Password is CORRECT!')
      } else {
        console.log('   ❌ Password is INCORRECT!')

        // Show what the hash looks like
        console.log(`   Hash preview: ${user.password.substring(0, 30)}...`)
      }
    } catch (error) {
      console.log('   ❌ Error comparing password:', error)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📋 Expected credentials:')
  console.log('   👨‍💼 admin@test.com / test123!')
  console.log('   👨‍👩‍👧 parent@test.com / test123!')
  console.log('   👩‍⚕️ therapists / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
