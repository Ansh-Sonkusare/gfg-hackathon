import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log('Initializing database...');

    // Run Prisma migrations
    console.log('Running migrations...');
    execSync('pnpm exec prisma migrate deploy', { stdio: 'inherit' });

    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('pnpm exec prisma generate', { stdio: 'inherit' });

    // Check if we should skip seeding
    const skipSeed = process.env.SKIP_SEED === 'true';

    if (!skipSeed) {
      // Check if database is already seeded
      const userCount = await prisma.user.count();

      if (userCount === 0) {
        console.log('Generating mock data...');
        execSync('pnpm exec tsx prisma/generate-mock-data.ts', { stdio: 'inherit' });
      } else {
        console.log('Database already has data, skipping mock data generation...');
      }
    } else {
      console.log('SKIP_SEED is true, skipping mock data generation...');
    }

    console.log('Database initialization completed!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase();