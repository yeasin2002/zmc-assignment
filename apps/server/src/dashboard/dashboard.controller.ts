import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { DashboardOpenApi } from './dashboard.openapi.js';
import { DashboardService } from './dashboard.service.js';

@DashboardOpenApi.controller()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @DashboardOpenApi.getStats()
  async getStats(@CurrentUser('id') userId: string) {
    return this.dashboardService.getStats(userId);
  }
}
