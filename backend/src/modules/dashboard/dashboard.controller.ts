import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get main dashboard metrics (MRR, active contracts, etc)' })
  getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get('upcoming-renewals')
  @ApiOperation({ summary: 'Get contracts expiring soon' })
  getUpcomingRenewals() {
    return this.dashboardService.getUpcomingRenewals();
  }

  @Get('recent-overdue')
  @ApiOperation({ summary: 'Get recent overdue receivables' })
  getRecentOverdue() {
    return this.dashboardService.getRecentOverdue();
  }
}
