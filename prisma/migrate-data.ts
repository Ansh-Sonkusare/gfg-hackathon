import { PrismaClient } from '@prisma/client';
import sqlite3 from 'sqlite3';

const postgresPrisma = new PrismaClient();

async function migrateData() {
  console.log('Starting data migration from SQLite to PostgreSQL...');

  const db = new sqlite3.Database('./prisma/database.sqlite');

  try {
    // Helper function to get all rows from a table
    const getAllRows = (tableName: string): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };

    // Migrate Users
    console.log('Migrating users...');
    const users = await getAllRows('users');
    for (const user of users) {
      await postgresPrisma.user.create({ data: user });
    }

    // Migrate Loans
    console.log('Migrating loans...');
    const loans = await getAllRows('loans');
    for (const loan of loans) {
      await postgresPrisma.loan.create({ data: loan });
    }

    // Migrate Transactions
    console.log('Migrating transactions...');
    const transactions = await getAllRows('transactions');
    for (const transaction of transactions) {
      await postgresPrisma.transaction.create({ data: transaction });
    }

    // Migrate LenderAdvertisements
    console.log('Migrating lender advertisements...');
    const ads = await getAllRows('lender_advertisements');
    for (const ad of ads) {
      await postgresPrisma.lenderAdvertisement.create({ data: ad });
    }

    // Migrate PaymentPlans
    console.log('Migrating payment plans...');
    const plans = await getAllRows('payment_plans');
    for (const plan of plans) {
      await postgresPrisma.paymentPlan.create({ data: plan });
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    db.close();
    await postgresPrisma.$disconnect();
  }
}

migrateData();