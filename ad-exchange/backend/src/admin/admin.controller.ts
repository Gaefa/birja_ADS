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

  // ─── Issuers ───────────────────────────────────────────────────────────────

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

  // ─── Disputes ─────────────────────────────────────────────────────────────

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

  // ─── Stats / Dashboard ─────────────────────────────────────────────────────

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ─── Commission Management ─────────────────────────────────────────────────

  /** GET /admin/commissions — global rate + per-blogger overrides */
  @Get('commissions')
  getCommissions() {
    return this.adminService.getCommissions();
  }

  /** PUT /admin/commissions/global — set global rate { rate: 0.10 } */
  @Put('commissions/global')
  setGlobalCommission(@Body() body: { rate: number }) {
    return this.adminService.setGlobalCommission(body.rate);
  }

  /** PUT /admin/commissions/blogger/:id — set per-blogger override */
  @Put('commissions/blogger/:id')
  setBloggerCommission(
    @Param('id', ParseIntPipe) bloggerId: number,
    @Body() body: { rate: number },
  ) {
    return this.adminService.setBloggerCommission(bloggerId, body.rate);
  }

  /** DELETE /admin/commissions/blogger/:id — reset to global */
  @Delete('commissions/blogger/:id')
  resetBloggerCommission(@Param('id', ParseIntPipe) bloggerId: number) {
    return this.adminService.resetBloggerCommission(bloggerId);
  }

  // ─── Exclusive Services ────────────────────────────────────────────────────

  @Get('exclusive-services')
  getExclusiveServices() {
    return this.adminService.getExclusiveServices();
  }

  @Post('exclusive-services')
  createExclusiveService(
    @Body()
    body: {
      name: string;
      description?: string;
      priceRub?: number;
      commRate?: number;
      bloggerId?: number | null;
    },
  ) {
    return this.adminService.createExclusiveService(body);
  }

  @Put('exclusive-services/:id')
  updateExclusiveService(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { commRate?: number; isActive?: boolean; priceRub?: number },
  ) {
    return this.adminService.updateExclusiveService(id, body);
  }

  @Delete('exclusive-services/:id')
  deleteExclusiveService(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteExclusiveService(id);
  }
}
