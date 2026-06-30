import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Users
  await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: {
      username: 'user',
      password: 'user', // In a real app, hash this!
      role: 'CITIZEN',
    },
  });

  await prisma.user.upsert({
    where: { username: 'police' },
    update: {},
    create: {
      username: 'police',
      password: 'police',
      role: 'POLICE',
    },
  });

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin',
      role: 'MANAGEMENT',
    },
  });

  // 2. Create Traffic Signals
  const signals = [
    { id: '信義基隆路口 - 北向', locationLat: 25.03310, locationLng: 121.55965, state: 'GREEN', timer: 45, mode: 'AUTO' },
    { id: '信義基隆路口 - 南向', locationLat: 25.03280, locationLng: 121.55965, state: 'GREEN', timer: 45, mode: 'AUTO' },
    { id: '信義基隆路口 - 東向', locationLat: 25.03295, locationLng: 121.55950, state: 'RED', timer: 48, mode: 'AUTO' },
    { id: '信義基隆路口 - 西向', locationLat: 25.03295, locationLng: 121.55980, state: 'RED', timer: 48, mode: 'AUTO' },
  ];

  for (const sig of signals) {
    const existing = await prisma.trafficSignal.findUnique({ where: { id: sig.id } });
    if (!existing) {
      await prisma.trafficSignal.create({ data: sig });
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
