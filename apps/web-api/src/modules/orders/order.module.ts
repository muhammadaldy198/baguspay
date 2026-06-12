import { forwardRef, Module } from '@nestjs/common'
import { DatabaseModule } from 'src/core/database/database.module'
import { QueueModule } from 'src/core/queue/queue.module'
import { DigiflazzModule } from 'src/integrations/h2h/digiflazz/digiflazz.module'
import { BalanceModule } from 'src/integrations/payment-gateway/balance/balance.module'
import { PaymentGatewayModule } from 'src/integrations/payment-gateway/payment-gateway.module'
import { AuthModule } from 'src/modules/auth/auth.module'
import { OffersModule } from 'src/modules/offers/offers.module'
import { PaymentsModule } from 'src/modules/payments/payments.module'
import { ProductsModule } from 'src/modules/products/products.module'
import { OrderController } from './order.controller'
import { OrderRepository } from './order.repository'
import { DigiflazzOrderProcessor } from './processor/digiflazz.processor'
import { OrderProcessor } from './processor/order.processor'
import { InquiryService } from './services/inquiry.service'
import { OrderService } from './services/order.service'
import { RefundService } from './services/refund.service'

@Module({
  imports: [
    PaymentGatewayModule,
    forwardRef(() => QueueModule),
    AuthModule,
    DatabaseModule,
    OffersModule,
    PaymentsModule,
    DigiflazzModule,
    ProductsModule,
    BalanceModule,
  ],
  exports: [OrderProcessor, OrderRepository, OrderService, RefundService],
  controllers: [OrderController],
  providers: [
    OrderRepository,
    OrderService,
    InquiryService,
    RefundService,
    OrderProcessor,
    DigiflazzOrderProcessor,
  ],
})
export class OrderModule {}
