import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/core/database/database.module'
import { PaymentAuthService } from './payment-auth.service'
import { PaymentsController } from './payments.controller'
import { PaymentsRepository } from './payments.repository'
import { PaymentsService } from './payments.service'
import { PinService } from './pin.service'

@Module({
  imports: [DatabaseModule],
  exports: [PaymentsService, PinService, PaymentAuthService],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository, PinService, PaymentAuthService],
})
export class PaymentsModule {}
