import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { GetWebRequest, PostWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { LoanFromApi } from '../../models/security/loan-from-api.model';
import { Loan } from '../../models/security/loan.model';

@Injectable()
export class LoanService {
  private readonly RESOURCE_URL = 'loans';

  constructor(private wsp: WebServiceProvider) {}

  getLoanFromSecurityId(securityId: number): Promise<Loan> {
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
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then((entities: LoanFromApi[]) =>
        entities.length === 0 ? null : this.formatLoan(entities[0])
      );
  }

  postLoan(entityToSave: Loan): Promise<Loan> {
    let requestBody = this.getLoanForServiceRequest(entityToSave);

    let postWebRequest: PostWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: requestBody
    };

    return this.wsp
      .post(postWebRequest)
      .then((entity: LoanFromApi) => this.formatLoan(entity));
  }

  putLoan(entityToSave: Loan): Promise<Loan> {
    let requestBody = this.getLoanForServiceRequest(entityToSave);
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: LoanFromApi) => this.formatLoan(entity));
  }

  formatLoan(entity: LoanFromApi): Loan {
    let couponRate = parseFloat(entity.coupon_rate),
      couponTypeId = parseInt(entity.coupon_type),
      firstCouponDateMoment = moment(entity.first_coupon_date, 'MM/DD/YYYY'),
      id = parseInt(entity.id),
      interestBasisId = parseInt(entity.interest_basis),
      maturityDateMoment = moment(entity.maturity_date, 'MM/DD/YYYY'),
      outstandingAmount = parseFloat(entity.outstanding_amount),
      paymentFrequencyId = parseInt(entity.payment_frequency),
      securityId = parseInt(entity.securityid);
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
    let entityForApi = {} as LoanFromApi,
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
