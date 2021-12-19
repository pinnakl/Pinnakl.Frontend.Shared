import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { PeLoan } from '@pnkl-frontend/shared';
import { AmortScheduleFromApi } from './amort-schedule-from-api.model';
import { AmortSchedule } from './amort-schedule.model';

@Injectable()
export class AmortScheduleService {
  private readonly _amortScheduleEndpoint = 'entities/amort_schedule';
  private readonly DATE_FORMAT = 'MM/DD/YYYY';

  constructor(private readonly wsp: WebServiceProvider) {}

  async getAmortData(peLoan: PeLoan): Promise<any> {
    const startDate = peLoan.firstAccrualDate;
    const maturityDate = peLoan.maturityDate;
    const monthsBetween = moment(startDate).diff(
      moment(maturityDate),
      'months',
      true
    );

    const amortPayments = await this.wsp.getHttp<any[]>({
      endpoint: 'entities/amort_payment',
      params: {
        fields: ['*'],
        filters: [
          {
            key: 'id',
            type: 'EQ',
            value: [peLoan.id.toString()]
          },
          {
            key: 'startDate',
            type: 'EQ',
            value: [
              moment(peLoan.firstAccrualDate).format('MM/DD/YYYY').toString()
            ]
          },
          {
            key: 'principal',
            type: 'EQ',
            value: [peLoan.faceAmount.toString()]
          },
          {
            key: 'interestRate',
            type: 'EQ',
            value: [peLoan.couponRate.toString()]
          },
          {
            key: 'period',
            type: 'EQ',
            value: [Math.abs(Math.round(monthsBetween)).toString()]
          }
        ]
      }
    });

    return amortPayments.length === 0
      ? null
      : amortPayments.map(this.formatAmortSchedule);
  }

  async getAmortScheduleFromLoanId(peLoanId: number): Promise<AmortSchedule[]> {
    const fields = [
      'balance',
      'id',
      'peLoanId',
      'paymentDate',
      'payment',
      'principal',
      'interest',
      'totalinterest'
    ];

    const amortSchedule = await this.wsp.getHttp<AmortScheduleFromApi[]>({
      endpoint: this._amortScheduleEndpoint,
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

    return amortSchedule.length === 0
      ? null
      : amortSchedule.map(this.formatAmortSchedule);
  }

  post(entity: Partial<AmortSchedule>): Promise<AmortSchedule> {
    const requestBody = this.getAmortScheduleForServiceRequest(entity);
    return this.wsp
      .post({ endPoint: this._amortScheduleEndpoint, payload: requestBody })
      .then((savedEntity: AmortScheduleFromApi) =>
        this.formatAmortSchedule(savedEntity)
      );
  }

  private formatAmortSchedule(entity: AmortScheduleFromApi): AmortSchedule {
    const paymentDateMoment = moment(entity.paymentdate, this.DATE_FORMAT);
    return {
      balance: !isNaN(parseFloat(entity.balance)) ? +entity.balance : null,
      id: +entity.id,
      peLoanId: +entity.peloanid,
      paymentDate: paymentDateMoment.isValid()
        ? paymentDateMoment.toDate()
        : null,
      payment: !isNaN(parseFloat(entity.payment)) ? +entity.payment : null,
      principal: !isNaN(parseFloat(entity.principal))
        ? +entity.principal
        : null,
      interest: !isNaN(parseFloat(entity.interest)) ? +entity.interest : null,
      totalInterest: !isNaN(parseFloat(entity.totalinterest))
        ? +entity.totalinterest
        : null
    };
  }

  private getAmortScheduleForServiceRequest(
    entity: Partial<AmortSchedule>
  ): Partial<AmortScheduleFromApi> {
    const entityForApi: Partial<AmortScheduleFromApi> = {},
      {
        balance,
        id,
        peLoanId,
        paymentDate,
        payment,
        principal,
        interest,
        totalInterest
      } = entity;
    if (balance !== undefined) {
      entityForApi.balance = balance === null ? 'null' : balance.toString();
    }
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
    if (totalInterest !== undefined) {
      entityForApi.totalinterest =
        totalInterest === null ? 'null' : totalInterest.toString();
    }
    return entityForApi;
  }
}
