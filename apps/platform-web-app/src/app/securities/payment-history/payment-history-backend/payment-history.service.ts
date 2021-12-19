import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { PaymentHistoryFromApi } from './payment-history-from-api.model';
import { PaymentHistory } from './payment-history.model';

@Injectable()
export class PaymentHistoryService {
  private readonly _peLoanPaymentHistoryEndpoint = 'entities/pe_loan_payment_history';
  private readonly DATE_FORMAT = 'MM/DD/YYYY';

  constructor(private readonly wsp: WebServiceProvider) {}

  async delete(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._peLoanPaymentHistoryEndpoint}/${id}`
    });
  }

  async getPaymentsHistoryFromLoanId(
    peLoanId: number
  ): Promise<PaymentHistory[]> {
    if (!peLoanId) {
      return Promise.resolve([] as PaymentHistory[]);
    }

    const fields = [
      'id',
      'peLoanId',
      'paymentDate',
      'payment',
      'principal',
      'interest'
    ];

    const paymentHistory = await this.wsp.getHttp<PaymentHistoryFromApi[]>({
      endpoint: this._peLoanPaymentHistoryEndpoint,
      params: {
        fields: fields,
        filters: [
          {
            key: 'peloanid',
            type: 'EQ',
            value: [peLoanId.toString()]
          }
        ]
      }
    });

    return paymentHistory.length === 0
      ? null
      : paymentHistory.map(this.formatPayment);
  }

  async post(entity: Partial<PaymentHistory>): Promise<PaymentHistory> {
    const savedEntity = await this.wsp.postHttp<PaymentHistoryFromApi>({
      endpoint: this._peLoanPaymentHistoryEndpoint,
      body: this.getPaymentHistoryForServiceRequest(entity)
    });

    return this.formatPayment(savedEntity);
  }

  async put(entity: Partial<PaymentHistory>): Promise<PaymentHistory> {
    const savedEntity = await this.wsp.putHttp<PaymentHistoryFromApi>({
      endpoint: this._peLoanPaymentHistoryEndpoint,
      body: this.getPaymentHistoryForServiceRequest(entity)
    });

    return this.formatPayment(savedEntity);
  }

  private formatPayment(entity: PaymentHistoryFromApi): PaymentHistory {
    const paymentDateMoment = moment(entity.paymentdate, this.DATE_FORMAT);
    return {
      id: +entity.id,
      peLoanId: +entity.peloanid,
      paymentDate: paymentDateMoment.isValid()
        ? paymentDateMoment.toDate()
        : null,
      payment: !isNaN(parseFloat(entity.payment)) ? +entity.payment : null,
      principal: !isNaN(parseFloat(entity.principal))
        ? +entity.principal
        : null,
      interest: !isNaN(parseFloat(entity.interest)) ? +entity.interest : null
    };
  }

  private getPaymentHistoryForServiceRequest(
    entity: Partial<PaymentHistory>
  ): Partial<PaymentHistoryFromApi> {
    const entityForApi: Partial<PaymentHistoryFromApi> = {},
      { id, peLoanId, paymentDate, payment, principal, interest } = entity;
    if (payment !== undefined) {
      entityForApi.payment = payment === null ? 'null' : payment.toString();
    }
    if (paymentDate !== undefined) {
      entityForApi.paymentdate =
        paymentDate === null
          ? 'null'
          : moment(paymentDate).format(this.DATE_FORMAT);
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (peLoanId !== undefined) {
      entityForApi.peloanid = peLoanId === null ? 'null' : peLoanId.toString();
    }
    if (principal !== undefined) {
      entityForApi.principal =
        principal === null ? 'null' : principal.toString();
    }
    if (interest !== undefined) {
      entityForApi.interest = interest === null ? 'null' : interest.toString();
    }
    return entityForApi;
  }
}
