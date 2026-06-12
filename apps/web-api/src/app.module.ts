import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './core/database/database.module'
import { QueueModule } from './core/queue/queue.module'
import { StorageModule } from './core/storage/storage.module'
import { AtlanticModule } from './integrations/h2h/atlantic/atlantic.module'
import { DigiflazzModule } from './integrations/h2h/digiflazz/digiflazz.module'
import { PaymentGatewayModule } from './integrations/payment-gateway/payment-gateway.module'
import { ModulesModule } from './modules/modules.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    }),

    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),

    DatabaseModule,
    PaymentGatewayModule,
    QueueModule,
    DigiflazzModule,
    AtlanticModule,
    StorageModule,
    ModulesModule,
  ],
})
export class AppModule {}
