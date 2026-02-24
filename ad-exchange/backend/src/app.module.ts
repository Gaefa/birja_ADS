import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BloggersModule } from './bloggers/bloggers.module';
import { IssuersModule } from './issuers/issuers.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { DealsModule } from './deals/deals.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BloggersModule,
    IssuersModule,
    CampaignsModule,
    DealsModule,
    AdminModule,
  ],
})
export class AppModule {}
