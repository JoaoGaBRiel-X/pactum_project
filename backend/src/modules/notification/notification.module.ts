import { Module, Scope } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TenantModule } from '../../tenant/tenant.module';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [
    TenantModule,
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [NotificationController],
  providers: [
    {
      provide: NotificationService,
      scope: Scope.REQUEST,
      useClass: NotificationService,
    },
    EmailProcessor,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
