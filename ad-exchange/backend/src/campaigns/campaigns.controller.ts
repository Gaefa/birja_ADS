import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ApplyCampaignDto } from './dto/apply-campaign.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getAllCampaigns(@CurrentUser() user: any) {
    return this.campaignsService.getAllCampaigns(user.id, user.role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getCampaignById(@Param('id', ParseIntPipe) id: number) {
    return this.campaignsService.getCampaignById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ISSUER')
  @ApiBearerAuth()
  createCampaign(@CurrentUser() user: any, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ISSUER')
  @ApiBearerAuth()
  updateCampaign(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.updateCampaign(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ISSUER')
  @ApiBearerAuth()
  cancelCampaign(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.campaignsService.cancelCampaign(user.id, id);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BLOGGER')
  @ApiBearerAuth()
  applyCampaign(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApplyCampaignDto,
  ) {
    return this.campaignsService.applyCampaign(user.id, id, dto);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ISSUER')
  @ApiBearerAuth()
  getApplications(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.campaignsService.getApplications(user.id, id);
  }

  @Put(':id/applications/:appId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ISSUER')
  @ApiBearerAuth()
  updateApplication(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) campaignId: number,
    @Param('appId', ParseIntPipe) appId: number,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.campaignsService.updateApplication(user.id, campaignId, appId, dto);
  }
}
