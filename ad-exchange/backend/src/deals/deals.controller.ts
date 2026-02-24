import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateDealDto } from './dto/create-deal.dto';
import { SubmitContentDto } from './dto/submit-content.dto';
import { OpenDisputeDto } from './dto/open-dispute.dto';

@ApiTags('Deals')
@Controller('deals')
export class DealsController {
  constructor(private dealsService: DealsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createDeal(@CurrentUser() user: any, @Body() dto: CreateDealDto) {
    return this.dealsService.createDeal(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyDeals(@CurrentUser() user: any) {
    return this.dealsService.getMyDeals(user.id, user.role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getDealById(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.dealsService.getDealById(id, user.id, user.role);
  }

  @Post(':id/fund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  fundEscrow(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.dealsService.fundEscrow(id, user.id);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  submitContent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: SubmitContentDto,
  ) {
    return this.dealsService.submitContent(id, user.id, dto);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  confirmDeal(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.dealsService.confirmDeal(id, user.id);
  }

  @Post(':id/dispute')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  openDispute(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: OpenDisputeDto,
  ) {
    return this.dealsService.openDispute(id, user.id, user.role, dto);
  }

  @Get(':id/dispute')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getDispute(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.dealsService.getDispute(id, user.id, user.role);
  }
}
