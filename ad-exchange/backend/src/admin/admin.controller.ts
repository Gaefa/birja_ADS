import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('issuers/pending')
  getPendingIssuers() {
    return this.adminService.getPendingIssuers();
  }

  @Post('issuers/:id/verify')
  verifyIssuer(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.verifyIssuer(id);
  }

  @Post('issuers/:id/reject')
  rejectIssuer(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.rejectIssuer(id);
  }

  @Get('disputes')
  getOpenDisputes() {
    return this.adminService.getOpenDisputes();
  }

  @Put('disputes/:id/resolve')
  resolveDispute(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { resolution: string },
  ) {
    return this.adminService.resolveDispute(id, body.resolution);
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }
}
