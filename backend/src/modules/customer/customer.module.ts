import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { PortalAuthModule } from '../portal/auth/portal-auth.module';

@Module({
  imports: [PortalAuthModule],
  controllers: [CustomerController],
  providers: [CustomerService]
})
export class CustomerModule {}
