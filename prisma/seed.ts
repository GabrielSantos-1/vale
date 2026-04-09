import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD. Define both env vars before running prisma seed.'
    );
  }

  if (adminPassword.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must have at least 12 characters.');
  }

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
