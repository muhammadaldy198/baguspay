import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { BlogModule } from './blog/blog.module'
import { CallbackModule } from './callbacks/callback.module'
import { DepositModule } from './deposits/deposit.module'
import { HealthModule } from './health/health.module'
import { HomeModule } from './home/home.module'
import { OffersModule } from './offers/offers.module'
import { OrderModule } from './orders/order.module'
import { PaymentsModule } from './payments/payments.module'
import { ProductCategoriesModule } from './product-categories/product-categories.module'
import { ProductsModule } from './products/products.module'
import { SettingsModule } from './settings/settings.module'
import { UserModule } from './users/user.module'

@Module({
  imports: [
    AuthModule,
    UserModule,
    HomeModule,
    OrderModule,
    DepositModule,
    ProductCategoriesModule,
    PaymentsModule,
    CallbackModule,
    ProductsModule,
    OffersModule,
    SettingsModule,
    BlogModule,
    HealthModule,
  ],
})
export class ModulesModule {}
