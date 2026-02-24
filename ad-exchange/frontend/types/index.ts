export interface User {
  id: string;
  email: string;
  role: 'BLOGGER' | 'ISSUER' | 'ADMIN';
  displayName?: string;
  companyName?: string;
  companyType?: string;
  isVerified?: boolean;
  isPro?: boolean;
  subscriptionTier?: 'BASE' | 'PRO';
}

export interface BloggerProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  niche?: string;
  geoCountry?: string;
  telegramContact?: string;
  rating: number;
  totalDeals: number;
  avatar?: string;
  socialAccounts: SocialAccount[];
  priceList: PriceListItem[];
  portfolio: PortfolioItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccount {
  id: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'telegram' | 'twitch';
  username: string;
  url: string;
  followersCount: number;
  avgViews?: number;
  engagementRate?: number;
  isVerified: boolean;
}

export interface PriceListItem {
  id: string;
  formatName: string;
  description: string;
  priceRub: number;
  durationDays: number;
  isAvailable: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
}

export interface IssuerProfile {
  id: string;
  userId: string;
  companyName: string;
  companyType: string;
  isVerified: boolean;
  isPro: boolean;
  logo?: string;
  website?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  issuerId: string;
  issuerName: string;
  title: string;
  description: string;
  brief?: string;
  budgetPerBlogger: number;
  currency: 'RUB' | 'USD' | 'USDT';
  bloggersNeeded: number;
  platforms: string[];
  deadline: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  campaignId: string;
  campaignTitle: string;
  bloggerId: string;
  bloggerName: string;
  issuerId: string;
  issuerName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'disputed';
  budget: number;
  currency: string;
  proposedPrice?: number;
  pitchText?: string;
  content?: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dispute {
  id: string;
  dealId: string;
  openedBy: 'blogger' | 'issuer';
  reason: string;
  description?: string;
  status: 'open' | 'resolved';
  resolution?: string;
  resolvedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CampaignApplication {
  id: string;
  campaignId: string;
  bloggerId: string;
  bloggerName: string;
  platform: string;
  proposedPrice: number;
  pitchText: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
