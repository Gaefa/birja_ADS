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

    return this.prisma.priceListItem.create({
      data: {
        bloggerId: profile.id,
        ...dto,
      },
    });
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

    return this.prisma.priceListItem.update({
      where: { id: itemId },
      data: dto,
    });
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

  async getAllBloggers() {
    return this.prisma.bloggerProfile.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: { id: true, email: true },
        },
        socialAccounts: true,
        priceListItems: true,
        portfolioItems: true,
      },
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
