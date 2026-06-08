const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

async function main() {
  console.log('Initializing database connection...');
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Clearing database...');
  await prisma.transaction.deleteMany({});
  await prisma.masterAccount.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('Seeding Categories...');
  const catAdobe = await prisma.category.create({ data: { name: 'Adobe' } });
  const catGemini = await prisma.category.create({ data: { name: 'Gemini' } });
  const catGrok = await prisma.category.create({ data: { name: 'Grok' } });
  const catNetflix = await prisma.category.create({ data: { name: 'Netflix' } });
  const catSpotify = await prisma.category.create({ data: { name: 'Spotify' } });
  const catYoutube = await prisma.category.create({ data: { name: 'YouTube' } });

  console.log('Seeding Master Accounts...');
  const netflix = await prisma.masterAccount.create({
    data: {
      accountName: 'Netflix Premium 4K - Akun #1',
      categoryId: catNetflix.id,
      registeredDate: new Date('2026-05-01'),
      expiredDate: new Date('2026-06-15'), // Expiring in a week
      lastPassword: 'supersecretpassnetflix',
    }
  });

  const spotify = await prisma.masterAccount.create({
    data: {
      accountName: 'Spotify Family Premium - Akun #1',
      categoryId: catSpotify.id,
      registeredDate: new Date('2026-05-10'),
      expiredDate: new Date('2026-06-09'), // Expiring tomorrow (within 2 days!)
      lastPassword: 'spotifypass123',
    }
  });

  const youtube = await prisma.masterAccount.create({
    data: {
      accountName: 'YouTube Premium No Ads - Akun #1',
      categoryId: catYoutube.id,
      registeredDate: new Date('2026-04-01'),
      expiredDate: new Date('2026-06-07'), // Already expired (yesterday)
      lastPassword: 'ytpassword999',
    }
  });

  console.log('Seeding Transactions...');
  
  // 1. Transaction that expired in the past
  await prisma.transaction.create({
    data: {
      accountId: netflix.id,
      customerName: 'Budi Santoso',
      orderNumber: 'INV-2026-0001',
      startDate: new Date('2026-05-01'),
      duration: 30,
      expiredDate: new Date('2026-05-31'), // Expired
    }
  });

  // 2. Transaction that expires today
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  await prisma.transaction.create({
    data: {
      accountId: spotify.id,
      customerName: 'Siti Rahma',
      orderNumber: 'INV-2026-0002',
      startDate: new Date(startToday.getTime() - 7 * 24 * 60 * 60 * 1000),
      duration: 7,
      expiredDate: startToday, // Expires today
    }
  });

  // 3. Transaction that is active (in the future)
  await prisma.transaction.create({
    data: {
      accountId: youtube.id,
      customerName: 'Joko Widodo',
      orderNumber: 'INV-2026-0003',
      startDate: new Date(startToday.getTime() - 2 * 24 * 60 * 60 * 1000),
      duration: 30,
      expiredDate: new Date(startToday.getTime() + 28 * 24 * 60 * 60 * 1000), // Active
    }
  });

  console.log('Database seeded successfully!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
