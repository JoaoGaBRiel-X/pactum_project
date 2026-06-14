import { Module } from '@nestjs/common';
import { RepresentativeController } from './representative.controller';
import { RepresentativeService } from './representative.service';

@Module({
  controllers: [RepresentativeController],
  providers: [RepresentativeService]
})
export class RepresentativeModule {}
