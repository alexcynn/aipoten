import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking database users...\n')

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  console.log(`Total users: ${allUsers.length}`)

  const adminUsers = allUsers.filter(u => u.role === 'ADMIN')
  console.log(`\nAdmin users: ${adminUsers.length}`)

  if (adminUsers.length > 0) {
    console.log('\nAdmin accounts:')
    adminUsers.forEach(admin => {
      console.log(`  - ${admin.email} (${admin.name})`)
    })
  } else {
    console.log('\n⚠️  No admin users found!')
  }

  console.log('\nAll users by role:')
  const roleGroups = allUsers.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  Object.entries(roleGroups).forEach(([role, count]) => {
    console.log(`  ${role}: ${count}`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
