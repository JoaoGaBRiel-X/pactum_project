import { Module } from '@nestjs/common';
import { ProductGroupService } from './product-group.service';
import { ProductGroupController } from './product-group.controller';

@Module({
  controllers: [ProductGroupController],
  providers: [ProductGroupService],
  exports: [ProductGroupService]
})
export class ProductGroupModule {}
