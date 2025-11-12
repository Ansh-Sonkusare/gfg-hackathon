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

function getRandomInt(index: number, max: number): number {
  return (index * 31) % max;
}

function getRandomFloat(index: number): number {
  return ((index * 31) % 100) / 100;
}

function generateEmail(name: string, id: number): string {
  const randomSuffix = getRandomInt(id, 10000);
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
    const firstName = firstNames[getRandomInt(i, firstNames.length)];
    const lastName = lastNames[getRandomInt(i, lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = generateEmail(name, i);
    const college = colleges[getRandomInt(i, colleges.length)];
    const collegeYear = getRandomInt(i, 4) + 1;
    const creditScore = getRandomInt(i, 350) + 550; // 550-900
    const trustBadge = getRandomFloat(i) > 0.7;
    const currentBalance = getRandomInt(i, 20000) + 500;
    const reputation = creditScore > 750 ? 'Excellent' : creditScore > 650 ? 'Good' : 'Fair';
    const emergencyCredit = getRandomInt(i, 1000) + 100;
    const riskTolerance = riskLevels[getRandomInt(i, riskLevels.length)];
    const loanAmount = amounts[getRandomInt(i, amounts.length)];
    const loanDuration = durations[getRandomInt(i, durations.length)];
    try {
       await prisma.user.create({
        data: {
          name,
          email,
          password: 'password123',
          role: getRandomFloat(i) > 0.5 ? 'borrower' : 'lender',
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
    if (getRandomFloat(borrower.id) > 0.6) {
      const amount = borrower.loanAmount;
      const duration = borrower.loanDuration;
      const interestRate = parseFloat((getRandomFloat(borrower.id) * 4 + 6).toFixed(2)); // 6-10% interest rate with 2 decimals

      // Calculate monthly interest and total amount (same logic as borrower router)
      const numberOfMonths = Math.ceil(duration / 30);
      const monthlyInterestRate = interestRate / 12; // Convert annual rate to monthly
      const monthlyPrincipal = amount / numberOfMonths;
      const monthlyInterest = amount * monthlyInterestRate;
      const dueAmount = Math.round(monthlyPrincipal + monthlyInterest);

      // Total amount due = principal + total interest over loan period
      const totalInterest = monthlyInterest * numberOfMonths;
      const totalDueAmount = Math.round(amount + totalInterest);

      try {
        const loan = await prisma.loan.create({
          data: {
            borrowerId: borrower.id,
            amount,
            remaining: totalDueAmount, // Now includes interest
            interestRate,
            status: 'pending',
            loanType: 'personal',
            nextDueDate: new Date(Date.now() + duration * 7 * 24 * 60 * 60 * 1000), // weeks
            progressPercent: 0,
            dueAmount,
            totalDueAmount,
          },
        });

        // Randomly fund the loan (50% chance)
        if (getRandomFloat(borrower.id) > 0.5) {
          const availableLenders = lenders.filter(l => l.currentBalance >= amount);
          if (availableLenders.length > 0) {
            const lender = availableLenders[getRandomInt(borrower.id, availableLenders.length)];

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
            if (getRandomFloat(borrower.id) > 0.5) {
              const progressPercent = getRandomInt(borrower.id, 50) + 10; // 10-60%
              const paidAmount = Math.floor(totalDueAmount * progressPercent / 100);
              const remaining = totalDueAmount - paidAmount;

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
    if (getRandomFloat(lender.id) > 0.4) {
      const numAds = getRandomInt(lender.id, 3) + 1; // 1-3 ads per lender

      for (let j = 0; j < numAds; j++) {
        const minAmount = amounts[getRandomInt(lender.id + j, amounts.length)];
        const maxAmount = amounts[getRandomInt(lender.id + j, amounts.length)];
        const minDuration = durations[getRandomInt(lender.id + j, durations.length)];
        const maxDuration = durations[getRandomInt(lender.id + j, durations.length)];

        try {
          await prisma.lenderAdvertisement.create({
            data: {
              lenderId: lender.id,
              minAmount: Math.min(minAmount, maxAmount),
              maxAmount: Math.max(minAmount, maxAmount),
                interestRate: parseFloat((getRandomFloat(lender.id + j) * 4 + 6).toFixed(2)), // 6-10% interest rate with 2 decimals
              minDuration: Math.min(minDuration, maxDuration),
              maxDuration: Math.max(minDuration, maxDuration),
              riskTolerance: riskLevels[getRandomInt(lender.id + j, riskLevels.length)],
              targetAudience: targetAudiences[getRandomInt(lender.id + j, targetAudiences.length)],
              isActive: getRandomFloat(lender.id + j) > 0.2, // 80% active
              priority: getRandomInt(lender.id + j, 10), // 0-9 priority
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
    if (getRandomFloat(loan.id) > 0.3) {
      const frequency = frequencies[getRandomInt(loan.id, frequencies.length)];
      const amount = Math.floor(loan.dueAmount * (0.8 + getRandomFloat(loan.id) * 0.4)); // 80-120% of due amount
      const numberOfInstallments = getRandomInt(loan.id, 12) + 1; // 1-12 installments

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
            isActive: getRandomFloat(loan.id) > 0.1, // 90% active
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