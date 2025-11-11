import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const firstNames = ['Aarav', 'Vihaan', 'Arjun', 'Reyansh', 'Vivaan', 'Advik', 'Arnav', 'Atharv', 'Ananya', 'Aadhya', 'Aaradhya', 'Anika', 'Anvi', 'Diya', 'Ishika', 'Kiara', 'Myra', 'Pari', 'Riya', 'Sara'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Jain', 'Agarwal', 'Mehta', 'Shah', 'Chauhan', 'Yadav', 'Rao', 'Nair', 'Iyer'];
const colleges = ['SIU Nagpur', 'Symbiosis Pune', 'IIT Bombay', 'IIT Delhi', 'BITS Pilani', 'VIT Vellore', 'SRM Chennai', 'Manipal Jaipur'];
const riskLevels = ['Low', 'Medium', 'High'];
const amounts = [200, 300, 400, 500, 600, 700, 800, 900, 1000];
const durations = [7, 14, 21, 30];
const targetAudiences = ['All Students', 'College Students', 'Graduate Students', 'First Year Students'];
const frequencies = ['daily', 'weekly', 'monthly'];

function generateEmail(name: string, id: number): string {
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${name.toLowerCase().replace(' ', '')}${id}${randomSuffix}@example.com`;
}

async function generateMockData(count: number = 50) {
  console.log('Removing existing data...');
  await prisma.transaction.deleteMany();
  await prisma.paymentPlan.deleteMany();
  await prisma.lenderAdvertisement.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.user.deleteMany();

  console.log(`Generating ${count} mock users...`);

  for (let i = 6; i <= count + 5; i++) { // Start from 6 to avoid conflicts with existing
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = generateEmail(name, i);
    const college = colleges[Math.floor(Math.random() * colleges.length)];
    const collegeYear = Math.floor(Math.random() * 4) + 1;
    const creditScore = Math.floor(Math.random() * 350) + 550; // 550-900
    const trustBadge = Math.random() > 0.7;
    const currentBalance = Math.floor(Math.random() * 20000) + 500;
    const reputation = creditScore > 750 ? 'Excellent' : creditScore > 650 ? 'Good' : 'Fair';
    const emergencyCredit = Math.floor(Math.random() * 1000) + 100;
    const riskTolerance = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const loanAmount = amounts[Math.floor(Math.random() * amounts.length)];
    const loanDuration = durations[Math.floor(Math.random() * durations.length)];
    try {
       await prisma.user.create({
        data: {
          name,
          email,
          password: 'password123',
          role: Math.random() > 0.5 ? 'borrower' : 'lender',
          collegeName: college,
          collegeYear,
          creditScore,
          trustBadge,
          currentBalance,
          reputation,
          emergencyCreditAvailable: emergencyCredit,
          riskTolerance,
          loanAmount,
          loanDuration,
        },
      });
    } catch (error) {
      console.error(`Error creating user ${name}:`, error);
    }
  }

  console.log('Generating mock loans...');

  // Get all users
  const users = await prisma.user.findMany();

  if (users.length < 2) {
    console.log('Not enough users, skipping loan generation.');
    return;
  }

  const borrowers = users.filter(u => u.role === 'borrower');
  const lenders = users.filter(u => u.role === 'lender');

  if (borrowers.length === 0 || lenders.length === 0) {
    console.log('Not enough borrowers or lenders, skipping loan generation.');
    return;
  }

  for (const borrower of borrowers) {
    // Randomly decide if this borrower requests a loan (40% chance)
    if (Math.random() > 0.6) {
      const amount = borrower.loanAmount;
      const duration = borrower.loanDuration;
      const dueAmount = Math.round(amount / duration);

      try {
        const loan = await prisma.loan.create({
          data: {
            borrowerId: borrower.id,
            amount,
            remaining: amount,
            interestRate: 0.08, // 8%
            status: 'pending',
            loanType: 'personal',
            nextDueDate: new Date(Date.now() + duration * 7 * 24 * 60 * 60 * 1000), // weeks
            progressPercent: 0,
            dueAmount,
          },
        });

        // Randomly fund the loan (50% chance)
        if (Math.random() > 0.5) {
          const availableLenders = lenders.filter(l => l.currentBalance >= amount);
          if (availableLenders.length > 0) {
            const lender = availableLenders[Math.floor(Math.random() * availableLenders.length)];

            await prisma.loan.update({
              where: { id: loan.id },
              data: { status: 'active', lenderId: lender.id },
            });

            // Create transactions
            await prisma.transaction.create({
              data: {
                userId: borrower.id,
                type: 'Loan Received',
                amount,
                positive: true,
              },
            });
            await prisma.transaction.create({
              data: {
                userId: lender.id,
                type: 'Loan Funded',
                amount,
                positive: false,
              },
            });

            // Update balances
            await prisma.user.update({
              where: { id: borrower.id },
              data: { currentBalance: borrower.currentBalance + amount },
            });
            await prisma.user.update({
              where: { id: lender.id },
              data: { currentBalance: lender.currentBalance - amount },
            });

            // Randomly add some payments
            if (Math.random() > 0.5) {
              const progressPercent = Math.floor(Math.random() * 50) + 10; // 10-60%
              const paidAmount = Math.floor(amount * progressPercent / 100);
              const remaining = amount - paidAmount;

              await prisma.loan.update({
                where: { id: loan.id },
                data: { progressPercent, remaining },
              });

              await prisma.transaction.create({
                data: {
                  userId: borrower.id,
                  type: 'Loan Payment',
                  amount: paidAmount,
                  positive: false,
                },
              });
              await prisma.transaction.create({
                data: {
                  userId: lender.id,
                  type: 'Loan Payment Received',
                  amount: paidAmount,
                  positive: true,
                },
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error creating loan for ${borrower.name}:`, error);
      }
    }
  }

  console.log('Generating mock lender advertisements...');

  // Generate advertisements for lenders
  for (const lender of lenders) {
    // Randomly decide if this lender creates advertisements (60% chance)
    if (Math.random() > 0.4) {
      const numAds = Math.floor(Math.random() * 3) + 1; // 1-3 ads per lender

      for (let i = 0; i < numAds; i++) {
        const minAmount = amounts[Math.floor(Math.random() * amounts.length)];
        const maxAmount = amounts[Math.floor(Math.random() * amounts.length)];
        const minDuration = durations[Math.floor(Math.random() * durations.length)];
        const maxDuration = durations[Math.floor(Math.random() * durations.length)];

        try {
          await prisma.lenderAdvertisement.create({
            data: {
              lenderId: lender.id,
              minAmount: Math.min(minAmount, maxAmount),
              maxAmount: Math.max(minAmount, maxAmount),
              interestRate: parseFloat((Math.random() * 5 + 5).toFixed(1)), // 5-10%
              minDuration: Math.min(minDuration, maxDuration),
              maxDuration: Math.max(minDuration, maxDuration),
              riskTolerance: riskLevels[Math.floor(Math.random() * riskLevels.length)],
              targetAudience: targetAudiences[Math.floor(Math.random() * targetAudiences.length)],
              isActive: Math.random() > 0.2, // 80% active
              priority: Math.floor(Math.random() * 10), // 0-9 priority
            },
          });
        } catch (error) {
          console.error(`Error creating advertisement for ${lender.name}:`, error);
        }
      }
    }
  }

  console.log('Generating mock payment plans...');

  // Get active loans for payment plan generation
  const activeLoans = await prisma.loan.findMany({
    where: { status: 'active' }
  });

  for (const loan of activeLoans) {
    // Randomly decide if this loan has a payment plan (70% chance)
    if (Math.random() > 0.3) {
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
      const amount = Math.floor(loan.dueAmount * (0.8 + Math.random() * 0.4)); // 80-120% of due amount
      const numberOfInstallments = Math.floor(Math.random() * 12) + 1; // 1-12 installments

      let nextPaymentDate = new Date();
      let endDate = new Date();

      switch (frequency) {
        case 'daily':
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 1);
          endDate.setDate(endDate.getDate() + numberOfInstallments);
          break;
        case 'weekly':
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
          endDate.setDate(endDate.getDate() + (numberOfInstallments * 7));
          break;
        case 'monthly':
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
          endDate.setMonth(endDate.getMonth() + numberOfInstallments);
          break;
      }

      try {
        await prisma.paymentPlan.create({
          data: {
            loanId: loan.id,
            userId: loan.borrowerId,
            frequency,
            amount,
            isActive: Math.random() > 0.1, // 90% active
            nextPaymentDate,
            endDate,
          },
        });
      } catch (error) {
        console.error(`Error creating payment plan for loan ${loan.id}:`, error);
      }
    }
  }

  console.log('Mock data generation completed!');
  }

generateMockData()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });