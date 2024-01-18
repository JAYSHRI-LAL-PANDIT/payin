import { Module } from '@nestjs/common';
import { PayinModule } from './payin/payin.module';

@Module({
  imports: [PayinModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
