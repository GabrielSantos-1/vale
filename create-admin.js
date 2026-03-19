const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@verdevale.com'
  const plainPassword = 'senha123'

  const existing = await prisma.adminUser.findUnique({
    where: { email },
  })

  if (existing) {
    console.log('Admin já existe.')
    return
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10)

  const admin = await prisma.adminUser.create({
    data: {
      name: 'admin',
      email,
      passwordHash,
      role: 'admin',
      isActive: true,
    },
  })

  console.log('Admin criado com sucesso:')
  console.log({
    id: admin.id,
    email: admin.email,
    password: plainPassword,
  })
}

main()
  .catch((error) => {
    console.error('Erro ao criar admin:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })