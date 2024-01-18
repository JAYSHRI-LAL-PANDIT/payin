import { Module } from '@nestjs/common';
import { PayinService } from './payin.service';
import { PayinController } from './payin.controller';

@Module({
  controllers: [PayinController],
  providers: [PayinService],
})
export class PayinModule {}
