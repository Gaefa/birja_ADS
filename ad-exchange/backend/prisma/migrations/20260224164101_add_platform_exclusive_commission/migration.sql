-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BloggerProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "niche" TEXT,
    "geoCountry" TEXT,
    "telegramContact" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rating" REAL NOT NULL DEFAULT 0,
    "totalDeals" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BloggerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bloggerId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "url" TEXT,
    "followersCount" INTEGER,
    "avgViews" INTEGER,
    "engagementRate" REAL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialAccount_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "BloggerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceListItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bloggerId" INTEGER NOT NULL,
    "formatName" TEXT NOT NULL,
    "description" TEXT,
    "priceRub" DECIMAL,
    "priceUsd" DECIMAL,
    "priceUsdt" DECIMAL,
    "durationDays" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "platform" TEXT,
    "isSpecialProject" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PriceListItem_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "BloggerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bloggerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "postUrl" TEXT,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PortfolioItem_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "BloggerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IssuerProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "companyType" TEXT NOT NULL,
    "website" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'BASE',
    "subscriptionExpiresAt" DATETIME,
    "rating" REAL NOT NULL DEFAULT 0,
    "totalDeals" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IssuerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "issuerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "brief" TEXT,
    "budgetPerBlogger" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL,
    "bloggersNeeded" INTEGER NOT NULL,
    "deadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "platforms" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "IssuerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignApplication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "campaignId" INTEGER NOT NULL,
    "bloggerId" INTEGER NOT NULL,
    "pitch" TEXT,
    "proposedPrice" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampaignApplication_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CampaignApplication_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "BloggerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "campaignApplicationId" INTEGER,
    "campaignId" INTEGER,
    "issuerId" INTEGER NOT NULL,
    "bloggerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT,
    "tz" TEXT,
    "socialPlatform" TEXT,
    "formatName" TEXT,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL,
    "platformCommission" DECIMAL NOT NULL DEFAULT 0,
    "bloggerAmount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "contentUrl" TEXT,
    "contentSubmittedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deal_campaignApplicationId_fkey" FOREIGN KEY ("campaignApplicationId") REFERENCES "CampaignApplication" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Deal_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Deal_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "IssuerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Deal_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "BloggerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dealId" INTEGER NOT NULL,
    "issuerId" INTEGER,
    "openedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedBy" INTEGER,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Dispute_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Dispute_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Dispute_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "IssuerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dealId" INTEGER NOT NULL,
    "authorRole" TEXT NOT NULL,
    "issuerId" INTEGER,
    "bloggerId" INTEGER,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "IssuerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "BloggerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dealId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommissionSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bloggerId" INTEGER,
    "priceItemId" INTEGER,
    "rate" DECIMAL NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" INTEGER,
    CONSTRAINT "CommissionSetting_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "BloggerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExclusiveService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceRub" DECIMAL NOT NULL DEFAULT 0,
    "commRate" DECIMAL NOT NULL DEFAULT 0.10,
    "bloggerId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExclusiveService_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "BloggerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BloggerProfile_userId_key" ON "BloggerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_bloggerId_platform_key" ON "SocialAccount"("bloggerId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "IssuerProfile_userId_key" ON "IssuerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignApplication_campaignId_bloggerId_key" ON "CampaignApplication"("campaignId", "bloggerId");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_campaignApplicationId_key" ON "Deal"("campaignApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_dealId_key" ON "Dispute"("dealId");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionSetting_bloggerId_key" ON "CommissionSetting"("bloggerId");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionSetting_priceItemId_key" ON "CommissionSetting"("priceItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ExclusiveService_key_key" ON "ExclusiveService"("key");
