import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.transaction.deleteMany();
  await prisma.review.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.campaignApplication.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.priceListItem.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.bloggerProfile.deleteMany();
  await prisma.issuerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared all data');

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@adexchange.ru',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  });
  console.log('Created admin:', admin.email);

  // Create issuers
  const issuer1 = await prisma.user.create({
    data: {
      email: 'issuer1@test.ru',
      password: await bcrypt.hash('pass123', 10),
      role: 'ISSUER',
    },
  });

  const issuer2 = await prisma.user.create({
    data: {
      email: 'issuer2@test.ru',
      password: await bcrypt.hash('pass123', 10),
      role: 'ISSUER',
    },
  });

  const issuerProfile1 = await prisma.issuerProfile.create({
    data: {
      userId: issuer1.id,
      companyName: 'Crypto Brokers Inc',
      companyType: 'BROKER',
      website: 'https://cryptobrokers.com',
      isVerified: true,
      verifiedAt: new Date(),
      subscriptionTier: 'PRO',
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const issuerProfile2 = await prisma.issuerProfile.create({
    data: {
      userId: issuer2.id,
      companyName: 'DeFi Exchange Ltd',
      companyType: 'DEFI',
      website: 'https://defiexchange.io',
      isVerified: true,
      verifiedAt: new Date(),
      subscriptionTier: 'BASE',
    },
  });

  console.log('Created issuers:', issuer1.email, issuer2.email);

  // Create bloggers
  const blogger1 = await prisma.user.create({
    data: {
      email: 'blogger1@test.ru',
      password: await bcrypt.hash('pass123', 10),
      role: 'BLOGGER',
    },
  });

  const blogger2 = await prisma.user.create({
    data: {
      email: 'blogger2@test.ru',
      password: await bcrypt.hash('pass123', 10),
      role: 'BLOGGER',
    },
  });

  const blogger3 = await prisma.user.create({
    data: {
      email: 'blogger3@test.ru',
      password: await bcrypt.hash('pass123', 10),
      role: 'BLOGGER',
    },
  });

  const bloggerProfile1 = await prisma.bloggerProfile.create({
    data: {
      userId: blogger1.id,
      displayName: 'Crypto King',
      bio: 'Blockchain and crypto enthusiast',
      niche: 'cryptocurrency',
      geoCountry: 'Russia',
      telegramContact: '@cryptoking',
      isActive: true,
    },
  });

  const bloggerProfile2 = await prisma.bloggerProfile.create({
    data: {
      userId: blogger2.id,
      displayName: 'Tech Vlogger',
      bio: 'Technology reviews and tutorials',
      niche: 'technology',
      geoCountry: 'Russia',
      telegramContact: '@techvlog',
      isActive: true,
    },
  });

  const bloggerProfile3 = await prisma.bloggerProfile.create({
    data: {
      userId: blogger3.id,
      displayName: 'Finance Guru',
      bio: 'Investment tips and financial advice',
      niche: 'finance',
      geoCountry: 'Russia',
      telegramContact: '@financeguru',
      isActive: true,
    },
  });

  console.log('Created bloggers');

  // Create social accounts
  await prisma.socialAccount.create({
    data: {
      bloggerId: bloggerProfile1.id,
      platform: 'TELEGRAM',
      username: 'cryptoking',
      url: 'https://t.me/cryptoking',
      followersCount: 50000,
      avgViews: 5000,
      engagementRate: 8.5,
      isVerified: true,
    },
  });

  await prisma.socialAccount.create({
    data: {
      bloggerId: bloggerProfile2.id,
      platform: 'YOUTUBE',
      username: 'TechVlogger',
      url: 'https://youtube.com/techvlogger',
      followersCount: 100000,
      avgViews: 15000,
      engagementRate: 12.0,
      isVerified: true,
    },
  });

  await prisma.socialAccount.create({
    data: {
      bloggerId: bloggerProfile3.id,
      platform: 'INSTAGRAM',
      username: 'finance.guru',
      url: 'https://instagram.com/finance.guru',
      followersCount: 30000,
      avgViews: 3000,
      engagementRate: 6.5,
      isVerified: false,
    },
  });

  console.log('Created social accounts');

  // Create price list items
  await prisma.priceListItem.create({
    data: {
      bloggerId: bloggerProfile1.id,
      formatName: 'Post in Telegram channel',
      description: 'Single post promoting your product',
      priceRub: 50000,
      priceUsd: 500,
      priceUsdt: 500,
      durationDays: 1,
      isAvailable: true,
    },
  });

  await prisma.priceListItem.create({
    data: {
      bloggerId: bloggerProfile1.id,
      formatName: 'Story series (3 days)',
      description: 'Daily stories for 3 days',
      priceRub: 100000,
      priceUsd: 1000,
      priceUsdt: 1000,
      durationDays: 3,
      isAvailable: true,
    },
  });

  await prisma.priceListItem.create({
    data: {
      bloggerId: bloggerProfile2.id,
      formatName: 'Video review',
      description: '5-10 min dedicated review video',
      priceRub: 150000,
      priceUsd: 1500,
      priceUsdt: 1500,
      durationDays: 5,
      isAvailable: true,
    },
  });

  console.log('Created price list items');

  // Create portfolio items
  await prisma.portfolioItem.create({
    data: {
      bloggerId: bloggerProfile1.id,
      title: 'Bitcoin pump prediction',
      description: 'Correctly predicted 30% pump',
      category: 'prediction',
    },
  });

  await prisma.portfolioItem.create({
    data: {
      bloggerId: bloggerProfile2.id,
      title: 'GPU review 2024',
      description: 'Detailed technical review',
      category: 'review',
    },
  });

  console.log('Created portfolio items');

  // Create campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      issuerId: issuerProfile1.id,
      title: 'Bitcoin Exchange Promotion',
      description: 'Promote our new Bitcoin trading platform',
      brief: 'Looking for crypto influencers',
      budgetPerBlogger: 100000,
      currency: 'RUB',
      bloggersNeeded: 5,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      isPrivate: false,
      platforms: ['TELEGRAM', 'TWITTER'],
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      issuerId: issuerProfile2.id,
      title: 'Private DeFi Collaboration',
      description: 'Exclusive partnership offer',
      brief: 'Premium tier only',
      budgetPerBlogger: 200000,
      currency: 'RUB',
      bloggersNeeded: 3,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      isPrivate: true,
      platforms: ['YOUTUBE'],
    },
  });

  console.log('Created campaigns');

  // Create campaign applications
  const app1 = await prisma.campaignApplication.create({
    data: {
      campaignId: campaign1.id,
      bloggerId: bloggerProfile1.id,
      pitch: 'I can reach 50k crypto enthusiasts in my channel',
      proposedPrice: 100000,
      status: 'PENDING',
    },
  });

  console.log('Created campaign applications');

  // Create a deal
  const deal1 = await prisma.deal.create({
    data: {
      campaignApplicationId: app1.id,
      issuerId: issuerProfile1.id,
      bloggerId: bloggerProfile1.id,
      title: 'Telegram promotion - Bitcoin Exchange',
      brief: 'Post about our trading platform',
      amount: 100000,
      currency: 'RUB',
      platformCommission: 10000,
      bloggerAmount: 90000,
      status: 'CREATED',
    },
  });

  console.log('Created deals');

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
