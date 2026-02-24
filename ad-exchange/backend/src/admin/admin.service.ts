import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingIssuers() {
    return this.prisma.issuerProfile.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async verifyIssuer(id: number) {
    const issuer = await this.prisma.issuerProfile.findUnique({
      where: { id },
    });

    if (!issuer) {
      throw new NotFoundException('Issuer not found');
    }

    return this.prisma.issuerProfile.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });
  }

  async rejectIssuer(id: number) {
    const issuer = await this.prisma.issuerProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!issuer) {
      throw new NotFoundException('Issuer not found');
    }

    // Delete issuer profile and user
    await this.prisma.issuerProfile.delete({
      where: { id },
    });

    await this.prisma.user.delete({
      where: { id: issuer.userId },
    });

    return { message: 'Issuer account deleted' };
  }

  async getOpenDisputes() {
    return this.prisma.dispute.findMany({
      where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      include: {
        deal: {
          select: {
            id: true,
            title: true,
            amount: true,
            currency: true,
            status: true,
            issuer: {
              select: { companyName: true },
            },
            blogger: {
              select: { displayName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async resolveDispute(id: number, resolution: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { deal: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const updatedDispute = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolution,
        resolvedAt: new Date(),
      },
    });

    // Update deal status based on resolution
    if (resolution.toLowerCase().includes('refund')) {
      await this.prisma.deal.update({
        where: { id: dispute.dealId },
        data: { status: 'REFUNDED' },
      });

      // Create refund transaction
      await this.prisma.transaction.create({
        data: {
          dealId: dispute.dealId,
          userId: dispute.deal.issuerId,
          type: 'REFUND',
          amount: dispute.deal.amount,
          currency: dispute.deal.currency,
          status: 'COMPLETED',
        },
      });
    }

    return updatedDispute;
  }

  async getStats() {
    const [
      totalUsers,
      totalBloggers,
      totalIssuers,
      totalDeals,
      completedDeals,
      totalDisputes,
      openDisputes,
      verifiedIssuers,
      unverifiedIssuers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.bloggerProfile.count(),
      this.prisma.issuerProfile.count(),
      this.prisma.deal.count(),
      this.prisma.deal.count({
        where: { status: 'COMPLETED' },
      }),
      this.prisma.dispute.count(),
      this.prisma.dispute.count({
        where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      }),
      this.prisma.issuerProfile.count({
        where: { isVerified: true },
      }),
      this.prisma.issuerProfile.count({
        where: { isVerified: false },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        bloggers: totalBloggers,
        issuers: totalIssuers,
      },
      deals: {
        total: totalDeals,
        completed: completedDeals,
      },
      disputes: {
        total: totalDisputes,
        open: openDisputes,
      },
      issuers: {
        verified: verifiedIssuers,
        unverified: unverifiedIssuers,
      },
    };
  }
}
