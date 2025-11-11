import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const borrower1 = await prisma.user.upsert({
    where: { email: 'arjun@example.com' },
    update: {},
    create: {
      name: "Arjun Singh",
      email: "arjun@example.com",
      password: "password123", // In production, hash this
      collegeName: "SIU Nagpur",
      collegeYear: 3,
      creditScore: 780,
      trustBadge: true,
      currentBalance: 15400,
      reputation: "Excellent",
      emergencyCreditAvailable: 800,
      riskTolerance: "Low",
      loanAmount: 300,
      loanDuration: 7
    },
  });

  await prisma.user.upsert({
    where: { email: 'priya@example.com' },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "priya@example.com",
      password: "password123",
      collegeName: "SIU Nagpur",
      collegeYear: 2,
      creditScore: 650,
      trustBadge: false,
      currentBalance: 2000,
      reputation: "Good",
      emergencyCreditAvailable: 300,
      riskTolerance: "Medium",
      loanAmount: 500,
      loanDuration: 14
    },
  });

  await prisma.user.upsert({
    where: { email: 'rahul@example.com' },
    update: {},
    create: {
      name: "Rahul Kumar",
      email: "rahul@example.com",
      password: "password123",
      collegeName: "Symbiosis Pune",
      collegeYear: 4,
      creditScore: 550,
      trustBadge: false,
      currentBalance: 500,
      reputation: "Fair",
      emergencyCreditAvailable: 100,
      riskTolerance: "High",
      loanAmount: 800,
      loanDuration: 21,
      role: "borrower"
    },
  });

  await prisma.user.upsert({
    where: { email: 'kavya@example.com' },
    update: {},
    create: {
      name: "Kavya Patel",
      email: "kavya@example.com",
      password: "password123",
      collegeName: "SIU Nagpur",
      collegeYear: 1,
      creditScore: 800,
      trustBadge: true,
      currentBalance: 10000,
      reputation: "Excellent",
      emergencyCreditAvailable: 1000,
      riskTolerance: "Low",
      loanAmount: 400,
      loanDuration: 14,
      role: "borrower"
    },
  });

  await prisma.user.upsert({
    where: { email: 'vikas@example.com' },
    update: {},
    create: {
      name: "Vikas Jain",
      email: "vikas@example.com",
      password: "password123",
      collegeName: "Symbiosis Pune",
      collegeYear: 3,
      creditScore: 600,
      trustBadge: false,
      currentBalance: 1500,
      reputation: "Good",
      emergencyCreditAvailable: 200,
      riskTolerance: "Medium",
      loanAmount: 600,
      loanDuration: 30,
      role: "borrower"
    },
  });

  const lender = await prisma.user.upsert({
    where: { email: 'aditya@example.com' },
    update: {},
    create: {
      name: "Aditya",
      email: "aditya@example.com",
      password: "password123", // In production, hash this
      role: "lender",
      collegeName: "SIU Nagpur",
      collegeYear: 3,
      creditScore: 750,
      trustBadge: true,
      currentBalance: 5200,
      reputation: "Good",
      emergencyCreditAvailable: 500,
      riskTolerance: "Low",
      loanAmount: 400,
      loanDuration: 14
    },
  });

  // Create loans
  await prisma.loan.createMany({
    data: [
      {
        borrowerId: borrower1.id,
        lenderId: lender.id,
        amount: 5000,
        remaining: 2400,
        interestRate: 7,
        status: 'active',
        loanType: 'personal',
        nextDueDate: new Date('2025-11-15'),
        progressPercent: 52,
        dueAmount: 500
      },
      {
        borrowerId: borrower1.id,
        lenderId: lender.id,
        amount: 2000,
        remaining: 800,
        interestRate: 5,
        status: 'active',
        loanType: 'emergency',
        nextDueDate: new Date('2025-11-20'),
        progressPercent: 60,
        dueAmount: 250
      }
    ]
  });

  console.log('Database seeded successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });