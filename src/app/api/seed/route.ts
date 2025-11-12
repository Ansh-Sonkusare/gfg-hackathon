import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST() {
  try {
    // Optional: Add authentication check here
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || authHeader !== `Bearer ${process.env.SEED_API_KEY}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('Starting manual database seeding...');

    // Run the mock data generation
    execSync('pnpm exec tsx prisma/generate-mock-data.ts', {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    return NextResponse.json({
      success: true,
      message: 'Mock data generated successfully'
    });

  } catch (error) {
    console.error('Seeding failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate mock data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Optional: GET endpoint to check seeding status
export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const userCount = await prisma.user.count();
    const loanCount = await prisma.loan.count();
    const adCount = await prisma.lenderAdvertisement.count();

    await prisma.$disconnect();

    return NextResponse.json({
      seeded: userCount > 0,
      userCount,
      loanCount,
      adCount
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check database status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}