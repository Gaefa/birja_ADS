import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { SubmitContentDto } from './dto/submit-content.dto';
import { OpenDisputeDto } from './dto/open-dispute.dto';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async createDeal(userId: number, dto: CreateDealDto) {
    const issuer = await this.prisma.issuerProfile.findUnique({
      where: { userId },
    });

    if (!issuer) {
      throw new NotFoundException('Issuer profile not found');
    }

    const blogger = await this.prisma.bloggerProfile.findUnique({
      where: { id: dto.bloggerId },
    });

    if (!blogger) {
      throw new NotFoundException('Blogger not found');
    }

    // ── Dynamic commission calculation ──────────────────────────────────────
    // Priority: per-blogger override → global setting → fallback 10%
    let commRate = 0.10;

    const perBloggerSetting = await this.prisma.commissionSetting.findUnique({
      where: { bloggerId: dto.bloggerId },
    });

    if (perBloggerSetting) {
      commRate = Number(perBloggerSetting.rate);
    } else {
      const globalSetting = await this.prisma.commissionSetting.findFirst({
        where: { bloggerId: null },
      });
      if (globalSetting) {
        commRate = Number(globalSetting.rate);
      }
    }

    const amount = Number(dto.amount);
    const platformCommission = Math.round(amount * commRate);
    const bloggerAmount = amount; // blogger receives full amount; issuer pays amount + commission
    // ────────────────────────────────────────────────────────────────────────

    return this.prisma.deal.create({
      data: {
        issuerId: issuer.id,
        bloggerId: dto.bloggerId,
        title: dto.title,
        brief: dto.brief ?? null,
        amount: dto.amount,
        currency: dto.currency,
        platformCommission,
        bloggerAmount,
        // New fields: channel, format, technical spec
        socialPlatform: dto.socialPlatform ?? null,
        formatName: dto.formatName ?? null,
        tz: dto.tz ?? null,
      },
      include: {
        issuer: {
          select: { companyName: true },
        },
        blogger: {
          select: { displayName: true },
        },
      },
    });
  }

  async getMyDeals(userId: number, userRole: string) {
    if (userRole === 'BLOGGER') {
      const blogger = await this.prisma.bloggerProfile.findUnique({
        where: { userId },
      });

      if (!blogger) {
        throw new NotFoundException('Blogger profile not found');
      }

      return this.prisma.deal.findMany({
        where: { bloggerId: blogger.id },
        include: {
          issuer: {
            select: {
              id: true,
              companyName: true,
              logo: true,
              rating: true,
            },
          },
          dispute: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (userRole === 'ISSUER') {
      const issuer = await this.prisma.issuerProfile.findUnique({
        where: { userId },
      });

      if (!issuer) {
        throw new NotFoundException('Issuer profile not found');
      }

      return this.prisma.deal.findMany({
        where: { issuerId: issuer.id },
        include: {
          blogger: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
              rating: true,
            },
          },
          dispute: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return [];
  }

  async getDealById(id: number, userId: number, userRole: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        issuer: {
          select: {
            id: true,
            userId: true,
            companyName: true,
            logo: true,
            rating: true,
          },
        },
        blogger: {
          select: {
            id: true,
            userId: true,
            displayName: true,
            avatar: true,
            rating: true,
          },
        },
        dispute: true,
        reviews: true,
        transactions: true,
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // Check permissions
    const isIssuer = userRole === 'ISSUER' && deal.issuer.userId === userId;
    const isBlogger = userRole === 'BLOGGER' && deal.blogger.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isIssuer && !isBlogger && !isAdmin) {
      throw new ForbiddenException('You do not have access to this deal');
    }

    return deal;
  }

  async fundEscrow(dealId: number, userId: number) {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      include: { issuer: true },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    if (deal.issuer.userId !== userId) {
      throw new ForbiddenException('Only the issuer can fund escrow');
    }

    if (deal.status !== 'CREATED') {
      throw new BadRequestException('Deal must be in CREATED status to fund escrow');
    }

    // Update deal status
    const updatedDeal = await this.prisma.deal.update({
      where: { id: dealId },
      data: { status: 'ESCROW_FUNDED' },
    });

    // Create escrow transaction
    await this.prisma.transaction.create({
      data: {
        dealId,
        userId: deal.issuer.userId,
        type: 'ESCROW_DEPOSIT',
        amount: deal.amount,
        currency: deal.currency,
        status: 'COMPLETED',
      },
    });

    return updatedDeal;
  }

  async submitContent(dealId: number, userId: number, dto: SubmitContentDto) {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      include: { blogger: true },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    if (deal.blogger.userId !== userId) {
      throw new ForbiddenException('Only the assigned blogger can submit content');
    }

    if (deal.status !== 'ESCROW_FUNDED') {
      throw new BadRequestException('Deal must have funded escrow before submitting content');
    }

    return this.prisma.deal.update({
      where: { id: dealId },
      data: {
        status: 'CONTENT_SUBMITTED',
        contentUrl: dto.contentUrl,
        contentSubmittedAt: new Date(),
      },
    });
  }

  async confirmDeal(dealId: number, userId: number) {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      include: { issuer: true },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    if (deal.issuer.userId !== userId) {
      throw new ForbiddenException('Only the issuer can confirm the deal');
    }

    if (deal.status !== 'CONTENT_SUBMITTED') {
      throw new BadRequestException('Content must be submitted before confirming');
    }

    // Update deal
    const updatedDeal = await this.prisma.deal.update({
      where: { id: dealId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Create payout transaction
    await this.prisma.transaction.create({
      data: {
        dealId,
        userId: deal.issuerId,
        type: 'BLOGGER_PAYOUT',
        amount: deal.bloggerAmount,
        currency: deal.currency,
        status: 'COMPLETED',
      },
    });

    // Update blogger stats
    const blogger = await this.prisma.bloggerProfile.findUnique({
      where: { id: deal.bloggerId },
    });

    if (blogger) {
      await this.prisma.bloggerProfile.update({
        where: { id: deal.bloggerId },
        data: {
          totalDeals: blogger.totalDeals + 1,
        },
      });
    }

    // Update issuer stats
    const issuer = await this.prisma.issuerProfile.findUnique({
      where: { id: deal.issuerId },
    });

    if (issuer) {
      await this.prisma.issuerProfile.update({
        where: { id: deal.issuerId },
        data: {
          totalDeals: issuer.totalDeals + 1,
        },
      });
    }

    return updatedDeal;
  }

  async openDispute(dealId: number, userId: number, userRole: string, dto: OpenDisputeDto) {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      include: { issuer: true, blogger: true, dispute: true },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // Check permissions
    const isIssuer = userRole === 'ISSUER' && deal.issuer.userId === userId;
    const isBlogger = userRole === 'BLOGGER' && deal.blogger.userId === userId;

    if (!isIssuer && !isBlogger) {
      throw new ForbiddenException('You do not have permission to open a dispute for this deal');
    }

    if (deal.dispute) {
      throw new BadRequestException('A dispute is already open for this deal');
    }

    const openedBy = isIssuer ? 'ISSUER' : 'BLOGGER';

    const dispute = await this.prisma.dispute.create({
      data: {
        dealId,
        openedBy,
        reason: dto.reason,
        description: dto.description,
        status: 'OPEN',
      },
    });

    // Update deal status
    await this.prisma.deal.update({
      where: { id: dealId },
      data: { status: 'DISPUTED' },
    });

    return dispute;
  }

  async getDispute(dealId: number, userId: number, userRole: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      include: { issuer: true, blogger: true, dispute: true },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    if (!deal.dispute) {
      throw new NotFoundException('No dispute found for this deal');
    }

    // Check permissions
    const isIssuer = userRole === 'ISSUER' && deal.issuer.userId === userId;
    const isBlogger = userRole === 'BLOGGER' && deal.blogger.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isIssuer && !isBlogger && !isAdmin) {
      throw new ForbiddenException('You do not have access to this dispute');
    }

    return deal.dispute;
  }
}
