import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IssuersService } from './issuers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateIssuerProfileDto } from './dto/update-issuer-profile.dto';

@ApiTags('Issuers')
@Controller('issuers')
export class IssuersController {
  constructor(private issuersService: IssuersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ISSUER')
  @ApiBearerAuth()
  getMyProfile(@CurrentUser() user: any) {
    return this.issuersService.getMyProfile(user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ISSUER')
  @ApiBearerAuth()
  updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateIssuerProfileDto,
  ) {
    return this.issuersService.updateProfile(user.id, dto);
  }

  @Get('me/subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ISSUER')
  @ApiBearerAuth()
  getSubscriptionStatus(@CurrentUser() user: any) {
    return this.issuersService.getSubscriptionStatus(user.id);
  }
}
