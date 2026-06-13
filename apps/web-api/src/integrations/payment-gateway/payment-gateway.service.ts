import { PaymentMethodProvider } from '@baguspay/db/types'
import { BadRequestException, Injectable } from '@nestjs/common'
import type { DBInstance } from 'src/common/types/db-instance'
import { BalanceService } from './balance/balance.service'
import { DuitkuService } from './duitku/duitku.service'
import type { PaymentCreator } from './payment.interface'
import type { CreatePaymentRequest } from './payment-gateway.type'
import { TripayService } from './tripay/tripay.service'

@Injectable()
export class PaymentGatewayService {
  private readonly providers: Partial<Record<PaymentMethodProvider, PaymentCreator>>

  constructor(
    tripayService: TripayService,
    duitkuService: DuitkuService,
    balanceService: BalanceService,
  ) {
    this.providers = {
      [PaymentMethodProvider.TRIPAY]: tripayService,
      [PaymentMethodProvider.DUITKU]: duitkuService,
      [PaymentMethodProvider.BALANCE]: balanceService,
    }
  }

  async createPayment(data: CreatePaymentRequest, tx?: DBInstance) {
    const paymentProvider = this.providers[data.provider_name]

    if (!paymentProvider) {
      throw new BadRequestException('Unsupported payment provider')
    }

    return paymentProvider.createTransaction(data, tx)
  }
}
