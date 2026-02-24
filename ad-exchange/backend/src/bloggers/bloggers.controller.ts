import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BloggersService } from './bloggers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateBloggerProfileDto } from './dto/update-blogger-profile.dto';
import { AddSocialAccountDto } from './dto/add-social-account.dto';
import { AddPriceItemDto } from './dto/add-price-item.dto';
import { AddPortfolioItemDto } from './dto/add-portfolio-item.dto';

@ApiTags('Bloggers')
@Controller('bloggers')
export class BloggersController {
  constructor(private bloggersService: BloggersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BLOGGER')
  @ApiBearerAuth()
  getMyProfile(@CurrentUser() user: any) {
    return this.bloggersService.getMyProfile(user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BLOGGER')
  @ApiBearerAuth()
  updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateBloggerProfileDto,
  ) {
    return this.bloggersService.updateProfile(user.id, dto);
  }

  @Post('me/socials')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BLOGGER')
  @ApiBearerAuth()
  addSocialAccount(
    @CurrentUser() user: any,
    @Body() dto: AddSocialAccountDto,
  ) {
    return this.bloggersService.addSocialAccount(user.id, dto);
  }

  @Delete('me/socials/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BLOGGER')
  @ApiBearerAuth()
  deleteSocialAccount(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bloggersService.deleteSocialAccount(user.id, id);
  }

  @Post('me/prices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BLOGGER')
  @ApiBearerAuth()
  addPriceItem(
    @CurrentUser() user: any,
    @Body() dto: AddPriceItemDto,
  ) {
    return this.bloggersService.addPriceItem(user.id, dto);
  }

  @Put('me/prices/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BLOGGER')
  @ApiBearerAuth()
  updatePriceItem(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddPriceItemDto,
  ) {
    return this.bloggersService.updatePriceItem(user.id, id, dto);
  }

  @Delete('me/prices/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BLOGGER')
  @ApiBearerAuth()
  deletePriceItem(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bloggersService.deletePriceItem(user.id, id);
  }

  @Post('me/portfolio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BLOGGER')
  @ApiBearerAuth()
  addPortfolioItem(
    @CurrentUser() user: any,
    @Body() dto: AddPortfolioItemDto,
  ) {
    return this.bloggersService.addPortfolioItem(user.id, dto);
  }

  @Delete('me/portfolio/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BLOGGER')
  @ApiBearerAuth()
  deletePortfolioItem(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bloggersService.deletePortfolioItem(user.id, id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ISSUER')
  @ApiBearerAuth()
  getAllBloggers() {
    return this.bloggersService.getAllBloggers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ISSUER')
  @ApiBearerAuth()
  getBloggerById(@Param('id', ParseIntPipe) id: number) {
    return this.bloggersService.getBloggerById(id);
  }
}
