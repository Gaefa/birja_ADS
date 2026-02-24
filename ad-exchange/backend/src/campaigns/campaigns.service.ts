import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IssuersService } from '../issuers/issuers.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ApplyCampaignDto } from './dto/apply-campaign.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private issuersService: IssuersService,
  ) {}

  async getAllCampaigns(userId: number, userRole: string) {
    if (userRole === 'BLOGGER') {
      // Bloggers see only public campaigns
      return this.prisma.campaign.findMany({
        where: {
          isPrivate: false,
          status: 'ACTIVE',
        },
        include: {
          issuer: {
            select: {
              id: true,
              companyName: true,
              logo: true,
              rating: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (userRole === 'ISSUER') {
      // Issuers see their own campaigns (including private)
      const issuer = await this.prisma.issuerProfile.findUnique({
        where: { userId },
      });

      if (!issuer) {
        throw new NotFoundException('Issuer profile not found');
      }

      return this.prisma.campaign.findMany({
        where: {
          issuerId: issuer.id,
        },
        include: {
          issuer: {
            select: {
              id: true,
              companyName: true,
              logo: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return [];
  }

  async getCampaignById(id: number) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        issuer: {
          select: {
            id: true,
            companyName: true,
            logo: true,
            rating: true,
            totalDeals: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async createCampaign(userId: number, dto: CreateCampaignDto) {
    const issuer = await this.prisma.issuerProfile.findUnique({
      where: { userId },
    });

    if (!issuer) {
      throw new NotFoundException('Issuer profile not found');
    }

    if (!issuer.isVerified) {
      throw new ForbiddenException('Your account must be verified to create campaigns');
    }

    // Check if issuer is Pro for private campaigns
    if (dto.isPrivate) {
      const subscription = await this.issuersService.getSubscriptionStatus(userId);
      if (!subscription.isActive) {
        throw new ForbiddenException('Private campaigns require an active Pro subscription');
      }
    }

    return this.prisma.campaign.create({
      data: {
        issuerId: issuer.id,
        deadline: new Date(dto.deadline),
        ...dto,
      },
      include: {
        issuer: {
          select: {
            companyName: true,
          },
        },
      },
    });
  }

  async updateCampaign(
    userId: number,
    campaignId: number,
    dto: UpdateCampaignDto,
  ) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { issuer: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.issuer.userId !== userId) {
      throw new ForbiddenException('You can only update your own campaigns');
    }

    const updateData: any = { ...dto };
    if (dto.deadline) {
      updateData.deadline = new Date(dto.deadline);
    }

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
    });
  }

  async cancelCampaign(userId: number, campaignId: number) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { issuer: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.issuer.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own campaigns');
    }

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'CANCELLED' },
    });
  }

  async applyCampaign(userId: number, campaignId: number, dto: ApplyCampaignDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const blogger = await this.prisma.bloggerProfile.findUnique({
      where: { userId },
    });

    if (!blogger) {
      throw new NotFoundException('Blogger profile not found');
    }

    // Check if already applied
    const existing = await this.prisma.campaignApplication.findUnique({
      where: {
        campaignId_bloggerId: {
          campaignId,
          bloggerId: blogger.id,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('You have already applied to this campaign');
    }

    return this.prisma.campaignApplication.create({
      data: {
        campaignId,
        bloggerId: blogger.id,
        ...dto,
      },
      include: {
        campaign: {
          select: { title: true },
        },
        blogger: {
          select: { displayName: true },
        },
      },
    });
  }

  async getApplications(userId: number, campaignId: number) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { issuer: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.issuer.userId !== userId) {
      throw new ForbiddenException('You can only view applications to your own campaigns');
    }

    return this.prisma.campaignApplication.findMany({
      where: { campaignId },
      include: {
        blogger: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            rating: true,
            totalDeals: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateApplication(
    userId: number,
    campaignId: number,
    appId: number,
    dto: UpdateApplicationDto,
  ) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { issuer: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.issuer.userId !== userId) {
      throw new ForbiddenException(
        'You can only manage applications to your own campaigns',
      );
    }

    const app = await this.prisma.campaignApplication.findUnique({
      where: { id: appId },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (app.campaignId !== campaignId) {
      throw new BadRequestException('Application does not belong to this campaign');
    }

    if (dto.status === 'ACCEPTED') {
      // Create a deal when accepting
      const blogger = await this.prisma.bloggerProfile.findUnique({
        where: { id: app.bloggerId },
      });

      const deal = await this.prisma.deal.create({
        data: {
          campaignApplicationId: appId,
          issuerId: campaign.issuerId,
          bloggerId: app.bloggerId,
          title: campaign.title,
          brief: campaign.brief,
          amount: app.proposedPrice,
          currency: campaign.currency,
          platformCommission: 0,
          bloggerAmount: app.proposedPrice,
        },
      });

      await this.prisma.campaignApplication.update({
        where: { id: appId },
        data: { status: 'ACCEPTED' },
      });

      return deal;
    } else {
      return this.prisma.campaignApplication.update({
        where: { id: appId },
        data: { status: 'REJECTED' },
      });
    }
  }
}
