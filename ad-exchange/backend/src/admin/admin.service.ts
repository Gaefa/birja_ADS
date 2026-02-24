import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const DEFAULT_COMMISSION_RATE = 0.10; // 10%

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── Issuer verification ──────────────────────────────────────────────────

  async getPendingIssuers() {
    return this.prisma.issuerProfile.findMany({
      where: { isVerified: false },
      include: {
        user: { select: { id: true, email: true, createdAt: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async verifyIssuer(id: number) {
    const issuer = await this.prisma.issuerProfile.findUnique({ where: { id } });
    if (!issuer) throw new NotFoundException('Issuer not found');

    return this.prisma.issuerProfile.update({
      where: { id },
      data: { isVerified: true, verifiedAt: new Date() },
    });
  }

  async rejectIssuer(id: number) {
    const issuer = await this.prisma.issuerProfile.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!issuer) throw new NotFoundException('Issuer not found');

    await this.prisma.issuerProfile.delete({ where: { id } });
    await this.prisma.user.delete({ where: { id: issuer.userId } });

    return { message: 'Issuer account deleted' };
  }

  // ─── Disputes ─────────────────────────────────────────────────────────────

  async getOpenDisputes() {
    return this.prisma.dispute.findMany({
      where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      include: {
        deal: {
          select: {
            id: true, title: true, amount: true, currency: true, status: true,
            issuer: { select: { companyName: true } },
            blogger: { select: { displayName: true } },
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
    if (!dispute) throw new NotFoundException('Dispute not found');

    const updatedDispute = await this.prisma.dispute.update({
      where: { id },
      data: { status: 'RESOLVED', resolution, resolvedAt: new Date() },
    });

    if (resolution.toLowerCase().includes('refund')) {
      await this.prisma.deal.update({
        where: { id: dispute.dealId },
        data: { status: 'REFUNDED' },
      });
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

  // ─── Stats / Dashboard ────────────────────────────────────────────────────

  async getStats() {
    const [
      totalUsers, totalBloggers, totalIssuers,
      totalDeals, completedDeals,
      totalDisputes, openDisputes,
      verifiedIssuers, unverifiedIssuers,
      escrowSum,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.bloggerProfile.count(),
      this.prisma.issuerProfile.count(),
      this.prisma.deal.count(),
      this.prisma.deal.count({ where: { status: 'COMPLETED' } }),
      this.prisma.dispute.count(),
      this.prisma.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
      this.prisma.issuerProfile.count({ where: { isVerified: true } }),
      this.prisma.issuerProfile.count({ where: { isVerified: false } }),
      this.prisma.transaction.aggregate({
        where: { type: 'ESCROW_DEPOSIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    // Last 6 months chart data
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });

    const chartDeals = await Promise.all(
      months.map(({ year, month }) =>
        this.prisma.deal.count({
          where: {
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
        }),
      ),
    );

    const chartUsers = await Promise.all(
      months.map(({ year, month }) =>
        this.prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
        }),
      ),
    );

    const chartCommission = await Promise.all(
      months.map(({ year, month }) =>
        this.prisma.transaction.aggregate({
          where: {
            type: 'PLATFORM_FEE',
            status: 'COMPLETED',
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
          _sum: { amount: true },
        }),
      ),
    );

    const monthLabels = months.map(({ year, month }) => {
      const d = new Date(year, month - 1, 1);
      return d.toLocaleString('ru', { month: 'short' });
    });

    return {
      users: { total: totalUsers, bloggers: totalBloggers, issuers: totalIssuers },
      deals: { total: totalDeals, completed: completedDeals },
      disputes: { total: totalDisputes, open: openDisputes },
      issuers: { verified: verifiedIssuers, unverified: unverifiedIssuers },
      escrow: { total: Number(escrowSum._sum.amount ?? 0) },
      charts: {
        labels: monthLabels,
        deals: chartDeals,
        users: chartUsers,
        commission: chartCommission.map(r => Number(r._sum.amount ?? 0)),
      },
    };
  }

  // ─── Commission Management ────────────────────────────────────────────────

  /** Returns global rate + all per-blogger overrides */
  async getCommissions() {
    const globalSetting = await this.prisma.commissionSetting.findFirst({
      where: { bloggerId: null, priceItemId: null },
    });
    const perBlogger = await this.prisma.commissionSetting.findMany({
      where: { bloggerId: { not: null } },
      include: { blogger: { select: { displayName: true } } },
    });

    return {
      globalRate: Number(globalSetting?.rate ?? DEFAULT_COMMISSION_RATE),
      perBlogger: perBlogger.map(s => ({
        bloggerId: s.bloggerId,
        bloggerName: s.blogger?.displayName,
        rate: Number(s.rate),
      })),
    };
  }

  /** Set or update the global commission rate */
  async setGlobalCommission(rate: number) {
    if (rate < 0 || rate > 0.5) {
      throw new BadRequestException('Rate must be between 0 and 0.5 (0%–50%)');
    }
    const existing = await this.prisma.commissionSetting.findFirst({
      where: { bloggerId: null, priceItemId: null },
    });

    if (existing) {
      return this.prisma.commissionSetting.update({
        where: { id: existing.id },
        data: { rate },
      });
    }
    return this.prisma.commissionSetting.create({
      data: { rate },
    });
  }

  /** Set per-blogger commission override */
  async setBloggerCommission(bloggerId: number, rate: number) {
    if (rate < 0 || rate > 0.5) {
      throw new BadRequestException('Rate must be between 0 and 0.5');
    }
    const blogger = await this.prisma.bloggerProfile.findUnique({ where: { id: bloggerId } });
    if (!blogger) throw new NotFoundException('Blogger not found');

    return this.prisma.commissionSetting.upsert({
      where: { bloggerId },
      create: { bloggerId, rate },
      update: { rate },
    });
  }

  /** Remove per-blogger override (resets to global rate) */
  async resetBloggerCommission(bloggerId: number) {
    await this.prisma.commissionSetting.deleteMany({ where: { bloggerId } });
    return { message: `Commission for blogger ${bloggerId} reset to global rate` };
  }

  // ─── Exclusive Services ───────────────────────────────────────────────────

  async getExclusiveServices() {
    return this.prisma.exclusiveService.findMany({
      include: { blogger: { select: { id: true, displayName: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createExclusiveService(data: {
    name: string;
    description?: string;
    priceRub?: number;
    commRate?: number;
    bloggerId?: number | null;
  }) {
    const key = `custom_${Date.now()}`;
    if (data.bloggerId) {
      const blogger = await this.prisma.bloggerProfile.findUnique({
        where: { id: data.bloggerId },
      });
      if (!blogger) throw new NotFoundException('Blogger not found');
    }

    return this.prisma.exclusiveService.create({
      data: {
        key,
        name: data.name,
        description: data.description,
        priceRub: data.priceRub ?? 0,
        commRate: data.commRate ?? DEFAULT_COMMISSION_RATE,
        bloggerId: data.bloggerId ?? null,
      },
      include: { blogger: { select: { id: true, displayName: true } } },
    });
  }

  async updateExclusiveService(
    id: number,
    data: { commRate?: number; isActive?: boolean; priceRub?: number },
  ) {
    const svc = await this.prisma.exclusiveService.findUnique({ where: { id } });
    if (!svc) throw new NotFoundException('Exclusive service not found');

    return this.prisma.exclusiveService.update({
      where: { id },
      data,
      include: { blogger: { select: { id: true, displayName: true } } },
    });
  }

  async deleteExclusiveService(id: number) {
    const svc = await this.prisma.exclusiveService.findUnique({ where: { id } });
    if (!svc) throw new NotFoundException('Exclusive service not found');
    await this.prisma.exclusiveService.delete({ where: { id } });
    return { message: `Exclusive service "${svc.name}" deleted` };
  }

  // ─── Author Tags ──────────────────────────────────────────────────────────
  // Tags are stored as JSON strings in BloggerProfile.niche for now;
  // a proper Tag model can be added in a future migration.
  // The admin manages the allowed tag list via a platform-level config endpoint.
}
