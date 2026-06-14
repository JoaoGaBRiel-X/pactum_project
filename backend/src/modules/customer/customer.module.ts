import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { PortalAuthModule } from '../portal/auth/portal-auth.module';
import { PrismaCustomerRepository } from './repositories/prisma-customer.repository';
import { CUSTOMER_REPOSITORY } from './repositories/customer.repository.interface';

@Module({
  imports: [PortalAuthModule],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    }
  ]
})
export class CustomerModule {}
