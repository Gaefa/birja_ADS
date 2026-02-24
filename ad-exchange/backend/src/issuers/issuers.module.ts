import { Module } from '@nestjs/common';
import { IssuersService } from './issuers.service';
import { IssuersController } from './issuers.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IssuersService],
  controllers: [IssuersController],
  exports: [IssuersService],
})
export class IssuersModule {}
