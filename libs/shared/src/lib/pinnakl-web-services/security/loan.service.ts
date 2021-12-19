import { Injectable } from '@angular/core';
import * as moment from 'moment';

import {
  WebServiceProvider
} from '@pnkl-frontend/core';
import { Loan } from '../../models/security';
import { LoanFromApi } from '../../models/security/loan-from-api.model';

@Injectable()
export class LoanService {
  private readonly _loansEndpoint = 'entities/loans';

  constructor(private readonly wsp: WebServiceProvider) { }

  async getLoanFromSecurityId(securityId: number): Promise<Loan> {
    const fields = [
      'Accruing_Indicator',
      'Coupon_Rate',
      'Coupon_Type',
      'Default_Indicator',
      'First_Coupon_Date',
      'Id',
      'Interest_Basis',
      'Maturity_Date',
      'Outstanding_Amount',
      'Payment_Frequency',
      'SecurityId'
    ];

    const loans = await this.wsp.getHttp<LoanFromApi[]>({
      endpoint: this._loansEndpoint,
      params: {
        fields: fields,
        filters: [
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    });
    return loans.length === 0 ? null : this.formatLoan(loans[0]);
  }

  async postLoan(entityToSave: Loan): Promise<Loan> {
    const entity = await this.wsp.postHttp<LoanFromApi>({
      endpoint: this._loansEndpoint,
      body: this.getLoanForServiceRequest(entityToSave)
    });

    return this.formatLoan(entity);
  }

  async putLoan(entityToSave: Loan): Promise<Loan> {
    const entity = await this.wsp.putHttp<LoanFromApi>({
      endpoint: this._loansEndpoint,
      body: this.getLoanForServiceRequest(entityToSave)
    });

    return this.formatLoan(entity);
  }

  formatLoan(entity: LoanFromApi): Loan {
    const couponRate = parseFloat(entity.coupon_rate),
      couponTypeId = parseInt(entity.coupon_type, 10),
      firstCouponDateMoment = moment(entity.first_coupon_date, 'MM/DD/YYYY'),
      id = parseInt(entity.id, 10),
      interestBasisId = parseInt(entity.interest_basis, 10),
      maturityDateMoment = moment(entity.maturity_date, 'MM/DD/YYYY'),
      outstandingAmount = parseFloat(entity.outstanding_amount),
      paymentFrequencyId = parseInt(entity.payment_frequency, 10),
      securityId = parseInt(entity.securityid, 10);
    return new Loan(
      entity.accruing_indicator === 'True',
      !isNaN(couponRate) ? couponRate : null,
      !isNaN(couponTypeId) ? couponTypeId : null,
      entity.default_indicator === 'True',
      firstCouponDateMoment.isValid() ? firstCouponDateMoment.toDate() : null,
      !isNaN(id) ? id : null,
      !isNaN(interestBasisId) ? interestBasisId : null,
      maturityDateMoment.isValid() ? maturityDateMoment.toDate() : null,
      !isNaN(outstandingAmount) ? outstandingAmount : null,
      !isNaN(paymentFrequencyId) ? paymentFrequencyId : null,
      !isNaN(securityId) ? securityId : null
    );
  }

  private getLoanForServiceRequest(entity: Loan): LoanFromApi {
    const entityForApi = {} as LoanFromApi,
      {
        accruingIndicator,
        couponRate,
        couponTypeId,
        defaultIndicator,
        firstCouponDate,
        id,
        interestBasisId,
        maturityDate,
        outstandingAmount,
        paymentFrequencyId,
        securityId
      } = entity;
    if (accruingIndicator !== undefined) {
      entityForApi.accruing_indicator = accruingIndicator ? '1' : '0';
    }
    if (couponRate !== undefined) {
      entityForApi.coupon_rate =
        couponRate !== null ? couponRate.toString() : 'null';
    }
    if (couponTypeId !== undefined) {
      entityForApi.coupon_type =
        couponTypeId !== null ? couponTypeId.toString() : 'null';
    }
    if (defaultIndicator !== undefined) {
      entityForApi.default_indicator = defaultIndicator ? '1' : '0';
    }
    if (firstCouponDate !== undefined) {
      entityForApi.first_coupon_date =
        firstCouponDate !== null
          ? moment(firstCouponDate).format('MM/DD/YYYY')
          : 'null';
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (interestBasisId !== undefined) {
      entityForApi.interest_basis =
        interestBasisId !== null ? interestBasisId.toString() : 'null';
    }
    if (maturityDate !== undefined) {
      entityForApi.maturity_date =
        maturityDate !== null
          ? moment(maturityDate).format('MM/DD/YYYY')
          : 'null';
    }
    if (outstandingAmount !== undefined) {
      entityForApi.outstanding_amount =
        outstandingAmount !== null ? outstandingAmount.toString() : 'null';
    }
    if (paymentFrequencyId !== undefined) {
      entityForApi.payment_frequency =
        paymentFrequencyId !== null ? paymentFrequencyId.toString() : 'null';
    }
    if (securityId !== undefined) {
      entityForApi.securityid = securityId.toString();
    }
    return entityForApi;
  }
}
