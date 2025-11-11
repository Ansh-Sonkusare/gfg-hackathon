import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const borrower = await prisma.user.upsert({
    where: { email: 'arjun@example.com' },
    update: {},
    create: {
      name: "Arjun Singh",
      email: "arjun@example.com",
      collegeName: "SIU Nagpur",
      collegeYear: 3,
      creditScore: 780,
      trustBadge: true,
      currentBalance: 15400,
      reputation: "Excellent",
      emergencyCreditAvailable: 800,
      role: "borrower"
    },
  });

  const lender = await prisma.user.upsert({
    where: { email: 'aditya@example.com' },
    update: {},
    create: {
      name: "Aditya",
      email: "aditya@example.com",
      collegeName: "SIU Nagpur",
      collegeYear: 3,
      creditScore: 750,
      trustBadge: true,
      currentBalance: 5200,
      reputation: "Good",
      emergencyCreditAvailable: 500,
      role: "lender"
    },
  });

  // Create loans
  await prisma.loan.createMany({
    data: [
      {
        borrowerId: borrower.id,
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
        borrowerId: borrower.id,
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