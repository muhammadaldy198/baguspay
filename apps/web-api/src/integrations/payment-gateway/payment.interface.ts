import type { db } from '@repo/db'
import type { CreatePaymentRequest, CreatePaymentResult } from './payment-gateway.type'

export interface PaymentCreator {
  createTransaction(
    data: CreatePaymentRequest,
    tx?: Parameters<Parameters<(typeof db)['transaction']>[0]>[0],
  ): Promise<CreatePaymentResult>
}

export interface PaymentGateway extends PaymentCreator {
  cancelTransaction(data: any): Promise<any>

  handleCallback(data: any): Promise<any>

  calculateFee(amountReceived: number, feeRate: number, fixedFee: number): number
}
