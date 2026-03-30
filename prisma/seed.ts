import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@verdevale.com';
  const adminPassword = 'TroqueAgora123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Administrador',
      passwordHash,
      role: 'admin',
      isActive: true,
    },
    create: {
      name: 'Administrador',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      isActive: true,
    },
  });

  console.log('Admin criado/atualizado com sucesso.');
  console.log(`Email: ${adminEmail}`);
  console.log(`Senha temporária: ${adminPassword}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Erro ao executar seed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
