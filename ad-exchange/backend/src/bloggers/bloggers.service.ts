import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateBloggerProfileDto } from './dto/update-blogger-profile.dto';
import { AddSocialAccountDto } from './dto/add-social-account.dto';
import { AddPriceItemDto } from './dto/add-price-item.dto';
import { AddPortfolioItemDto } from './dto/add-portfolio-item.dto';

@Injectable()
export class BloggersService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    const profile = await this.prisma.bloggerProfile.findUnique({
      where: { userId },
      include: {
        socialAccounts: true,
        priceListItems: true,
        portfolioItems: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Blogger profile not found');
    }

    return profile;
  }

  async updateProfile(userId: number, dto: UpdateBloggerProfileDto) {
    const profile = await this.prisma.bloggerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Blogger profile not found');
    }

    return this.prisma.bloggerProfile.update({
      where: { userId },
      data: dto,
      include: {
        socialAccounts: true,
        priceListItems: true,
        portfolioItems: true,
      },
    });
  }

  async addSocialAccount(userId: number, dto: AddSocialAccountDto) {
    const profile = await this.prisma.bloggerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Blogger profile not found');
    }

    return this.prisma.socialAccount.create({
      data: {
        bloggerId: profile.id,
        ...dto,
      },
    });
  }

  async deleteSocialAccount(userId: number, socialId: number) {
    const social = await this.prisma.socialAccount.findUnique({
      where: { id: socialId },
      include: { blogger: true },
    });

    if (!social) {
      throw new NotFoundException('Social account not found');
    }

    if (social.blogger.userId !== userId) {
      throw new ForbiddenException('You cannot delete other bloggers social accounts');
    }

    return this.prisma.socialAccount.delete({
      where: { id: socialId },
    });
  }

  async addPriceItem(userId: number, dto: AddPriceItemDto) {
    const profile = await this.prisma.bloggerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Blogger profile not found');
    }

    // Sanitize: isSpecialProject=true → force priceRub=0; empty platform → null
    const data: any = {
      bloggerId: profile.id,
      formatName: dto.formatName,
      description: dto.description,
      priceRub: dto.isSpecialProject ? 0 : (dto.priceRub ?? 0),
      isAvailable: dto.isAvailable ?? true,
      isSpecialProject: dto.isSpecialProject ?? false,
      platform: dto.platform || null,
    };

    return this.prisma.priceListItem.create({ data });
  }

  async updatePriceItem(userId: number, itemId: number, dto: AddPriceItemDto) {
    const item = await this.prisma.priceListItem.findUnique({
      where: { id: itemId },
      include: { blogger: true },
    });

    if (!item) {
      throw new NotFoundException('Price item not found');
    }

    if (item.blogger.userId !== userId) {
      throw new ForbiddenException('You cannot update other bloggers price items');
    }

    // Sanitize same way as addPriceItem
    const data: any = {
      formatName: dto.formatName,
      description: dto.description,
      priceRub: dto.isSpecialProject ? 0 : (dto.priceRub ?? item.priceRub),
      isAvailable: dto.isAvailable ?? item.isAvailable,
      isSpecialProject: dto.isSpecialProject ?? false,
      platform: dto.platform || null,
    };

    return this.prisma.priceListItem.update({ where: { id: itemId }, data });
  }

  async deletePriceItem(userId: number, itemId: number) {
    const item = await this.prisma.priceListItem.findUnique({
      where: { id: itemId },
      include: { blogger: true },
    });

    if (!item) {
      throw new NotFoundException('Price item not found');
    }

    if (item.blogger.userId !== userId) {
      throw new ForbiddenException('You cannot delete other bloggers price items');
    }

    return this.prisma.priceListItem.delete({
      where: { id: itemId },
    });
  }

  async addPortfolioItem(userId: number, dto: AddPortfolioItemDto) {
    const profile = await this.prisma.bloggerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Blogger profile not found');
    }

    return this.prisma.portfolioItem.create({
      data: {
        bloggerId: profile.id,
        ...dto,
      },
    });
  }

  async deletePortfolioItem(userId: number, itemId: number) {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id: itemId },
      include: { blogger: true },
    });

    if (!item) {
      throw new NotFoundException('Portfolio item not found');
    }

    if (item.blogger.userId !== userId) {
      throw new ForbiddenException('You cannot delete other bloggers portfolio items');
    }

    return this.prisma.portfolioItem.delete({
      where: { id: itemId },
    });
  }

  async getAllBloggers(filters?: {
    platform?: string;
    minFollowers?: number;
    maxPrice?: number;
    search?: string;
  }) {
    // Base query: only active bloggers
    const bloggers = await this.prisma.bloggerProfile.findMany({
      where: {
        isActive: true,
        // Full-text search on displayName / niche
        ...(filters?.search
          ? {
              OR: [
                { displayName: { contains: filters.search, mode: 'insensitive' } },
                { niche: { contains: filters.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { id: true, email: true } },
        socialAccounts: true,
        priceListItems: true,
        portfolioItems: true,
      },
    });

    // Post-query filtering (platform, followers, price)
    return bloggers.filter((b) => {
      // Platform filter: blogger must have at least one social account on this platform
      if (filters?.platform) {
        const hasPlatform = b.socialAccounts.some(
          (s) => s.platform === filters.platform,
        );
        if (!hasPlatform) return false;
      }

      // minFollowers: any social account meets the threshold
      if (filters?.minFollowers) {
        const maxFollowers = Math.max(...b.socialAccounts.map((s) => s.followersCount ?? 0), 0);
        if (maxFollowers < filters.minFollowers) return false;
      }

      // maxPrice: blogger must have at least one non-special item within budget
      if (filters?.maxPrice) {
        const paidItems = b.priceListItems.filter(
          (p) => p.isAvailable && !p.isSpecialProject && Number(p.priceRub) > 0,
        );
        if (paidItems.length === 0) return false;
        const minPrice = Math.min(...paidItems.map((p) => Number(p.priceRub)));
        if (minPrice > filters.maxPrice) return false;
      }

      return true;
    });
  }

  async getBloggerById(id: number) {
    const blogger = await this.prisma.bloggerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true },
        },
        socialAccounts: true,
        priceListItems: true,
        portfolioItems: true,
      },
    });

    if (!blogger) {
      throw new NotFoundException('Blogger not found');
    }

    return blogger;
  }
}
