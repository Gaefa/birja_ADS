import { Module } from '@nestjs/common';
import { BloggersService } from './bloggers.service';
import { BloggersController } from './bloggers.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BloggersService],
  controllers: [BloggersController],
  exports: [BloggersService],
})
export class BloggersModule {}
