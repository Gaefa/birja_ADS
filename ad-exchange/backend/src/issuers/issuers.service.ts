import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateIssuerProfileDto } from './dto/update-issuer-profile.dto';

@Injectable()
export class IssuersService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    const profile = await this.prisma.issuerProfile.findUnique({
      where: { userId },
      include: {
        campaigns: {
          select: {
            id: true,
            title: true,
            status: true,
            bloggersNeeded: true,
            deadline: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Issuer profile not found');
    }

    return profile;
  }

  async updateProfile(userId: number, dto: UpdateIssuerProfileDto) {
    const profile = await this.prisma.issuerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Issuer profile not found');
    }

    return this.prisma.issuerProfile.update({
      where: { userId },
      data: dto,
      include: {
        campaigns: {
          select: {
            id: true,
            title: true,
            status: true,
            bloggersNeeded: true,
            deadline: true,
          },
        },
      },
    });
  }

  async getSubscriptionStatus(userId: number) {
    const profile = await this.prisma.issuerProfile.findUnique({
      where: { userId },
      select: {
        subscriptionTier: true,
        subscriptionExpiresAt: true,
        isVerified: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Issuer profile not found');
    }

    const isActive =
      profile.subscriptionTier === 'PRO' &&
      profile.subscriptionExpiresAt &&
      profile.subscriptionExpiresAt > new Date();

    return {
      tier: profile.subscriptionTier,
      isActive,
      expiresAt: profile.subscriptionExpiresAt,
      isVerified: profile.isVerified,
    };
  }

  async getProfileById(id: number) {
    const profile = await this.prisma.issuerProfile.findUnique({
      where: { id },
      include: {
        campaigns: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            title: true,
            bloggersNeeded: true,
            deadline: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Issuer profile not found');
    }

    return profile;
  }
}
