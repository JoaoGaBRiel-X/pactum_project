import { Controller, Get, Post, Body, Param, Put, Delete, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Notification Templates')
@Controller('notification-templates')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'List all notification templates' })
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a template by ID' })
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  create(@Body() body: any, @Req() req: any) {
    const userId = req.user?.id || 'system-user';
    return this.notificationService.create(body, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a template' })
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.id || 'system-user';
    return this.notificationService.update(id, body, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a template' })
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
