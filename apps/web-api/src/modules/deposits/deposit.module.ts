import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/core/database/database.module'
import { QueueModule } from 'src/core/queue/queue.module'
import { BalanceModule } from 'src/integrations/payment-gateway/balance/balance.module'
import { PaymentGatewayModule } from 'src/integrations/payment-gateway/payment-gateway.module'
import { DepositController } from './deposit.controller'
import { DepositRepository } from './deposit.repository'
import { DepositService } from './deposit.service'

@Module({
  imports: [DatabaseModule, PaymentGatewayModule, QueueModule, BalanceModule],
  exports: [DepositService],
  controllers: [DepositController],
  providers: [DepositService, DepositRepository],
})
export class DepositModule {}
