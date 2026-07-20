import { config as loadEnv } from 'dotenv';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

loadEnv({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const userPassword = await bcrypt.hash('User123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      name: 'Admin User',
      passwordHash: adminPassword,
      role: Role.ADMIN
    },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: Role.ADMIN
    }
  });

  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {
      name: 'Demo Customer',
      passwordHash: userPassword,
      role: Role.USER
    },
    create: {
      email: 'customer@example.com',
      name: 'Demo Customer',
      passwordHash: userPassword,
      role: Role.USER
    }
  });

  await prisma.product.deleteMany();
  await prisma.product.createMany({
    data: [
      {
        name: 'Orbit Wireless Headphones',
        description: 'Noise-canceling over-ear headphones with all-day comfort and a rich sound profile.',
        imageUrl: 'https://images.unsplash.com/photo-1518441312474-5cae3bf3b4f5?auto=format&fit=crop&w=1200&q=80',
        price: 129.99,
        inventory: 24
      },
      {
        name: 'Lumen Smart Lamp',
        description: 'Minimal desk lamp with adjustable brightness, warm-to-cool tones, and USB-C charging.',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
        price: 79.0,
        inventory: 18
      },
      {
        name: 'TrailPack Backpack',
        description: 'Weather-resistant everyday backpack with padded laptop sleeve and modular storage.',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
        price: 149.5,
        inventory: 32
      },
      {
        name: 'Pulse Smart Watch',
        description: 'Fitness-focused smartwatch with heart-rate tracking, sleep insights, and GPS.',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
        price: 199.0,
        inventory: 14
      }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
