import { Injectable } from '@angular/core';
import {
  GetWebRequest,
  PostWebRequest,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { PeLoan, PeLoanApi } from '../../models';
import * as moment from 'moment';

@Injectable()
export class PeloanService {
  private readonly RESOURCE_URL = 'pe_loans';
  constructor(private wsp: WebServiceProvider) {}

  postLoan(peLoan: PeLoan): Promise<PeLoan> {
    const payload: any = this.formatLoanData(peLoan);
    let postWebRequest: PostWebRequest = {
      endPoint: this.RESOURCE_URL,
      payload: payload
    };

    return this.wsp.post(postWebRequest).then((entity: PeLoanApi) => {
      return this.formatPeLoanApi(entity);
    });
  }

  getPeLoanDetailsById(id: number): Promise<PeLoan> {
    let getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: ['*'],
        filters: [
          {
            key: 'id',
            type: 'EQ',
            value: [id.toString()]
          }
        ]
      }
    };
    return this.wsp.get(getWebRequest).then((entity: PeLoanApi[]) => {
      if (entity && entity.length > 0) {
        return this.formatPeLoanApi(entity[0]);
      }
      return null;
    });
  }

  putLoan(peLoan: PeLoan): Promise<PeLoan> {
    let requestBody = this.fromPutLoanPayload(peLoan);
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: PeLoanApi) => this.formatPeLoanApi(entity));
  }

  fromPutLoanPayload(peLoan: PeLoan): any {
    let formattedLoanData = {};

    for (let key in peLoan) {
      if (peLoan.hasOwnProperty(key)) {
        if (key === 'accruingIndicator') {
          if (!peLoan[key] && peLoan[key] !== false) {
            formattedLoanData[key] = 'null';
          } else {
            formattedLoanData[key] = peLoan[key] ? 1 : 0;
          }
        } else {
          formattedLoanData[key] = peLoan[key] ? peLoan[key] : 'null';
        }
      }
    }

    return formattedLoanData;
  }

  getPeLoanFromSecurityId(securityId: number): Promise<PeLoan> {
    if (!securityId) {
      return Promise.resolve({} as PeLoan);
    }
    let getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: ['*'],
        filters: [
          {
            key: 'securityId',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    };

    return this.wsp.get(getWebRequest).then((entity: PeLoanApi[]) => {
      if (entity && entity.length > 0) {
        return this.formatPeLoanApi(entity[0]);
      }
      return null;
    });
  }

  formatPeLoanApi(entity: PeLoanApi): PeLoan {
    const loan: PeLoan = {
      accruingIndicator: entity.accruingindicator
        ? entity.accruingindicator === 'True'
          ? true
          : false
        : null,
      couponRate: entity.couponrate ? parseFloat(entity.couponrate) : null,
      couponTypeId: entity.coupontypeid ? parseInt(entity.coupontypeid) : null,
      couponType: entity.coupontype,
      firstAccrualDate: entity.firstaccrualdate
        ? moment(entity.firstaccrualdate, 'MM/DD/YYYY').toDate()
        : null,
      firstCouponDate: entity.firstcoupondate
        ? moment(entity.firstcoupondate, 'MM/DD/YYYY').toDate()
        : null,
      id: parseInt(entity.id),
      interestBasisId: entity.interestbasisid
        ? parseInt(entity.interestbasisid)
        : null,
      faceAmount: entity.faceamount ? parseInt(entity.faceamount) : null,
      maturityDate: entity.maturitydate
        ? moment(entity.maturitydate, 'MM/DD/YYYY').toDate()
        : null,
      paymentFrequencyId: entity.paymentfrequencyid
        ? parseInt(entity.paymentfrequencyid)
        : null,
      paymentFrequency: entity.paymentfrequency,
      securityId: entity.securityid ? parseInt(entity.securityid) : null,
      creditQuality: entity.creditquality ? entity.creditquality : null,
      status: entity.status ? entity.status : null,
      geography: entity.geography ? entity.geography : null
    };
    return loan;
  }

  formatLoanData(peLoan: PeLoan): any {
    return {
      accruingIndicator: peLoan.accruingIndicator ? 1 : 0,
      couponRate: peLoan.couponRate ? peLoan.couponRate.toString() : 'null',
      couponTypeId: peLoan.couponTypeId
        ? peLoan.couponTypeId.toString()
        : 'null',
      firstAccrualDate: peLoan.firstAccrualDate
        ? peLoan.firstAccrualDate
        : 'null',
      firstCouponDate: peLoan.firstCouponDate ? peLoan.firstCouponDate : 'null',
      interestBasisId: peLoan.interestBasisId
        ? peLoan.interestBasisId.toString()
        : 'null',
      faceAmount: peLoan.faceAmount ? peLoan.faceAmount.toString() : 'null',
      maturityDate: peLoan.maturityDate ? peLoan.maturityDate : 'null',
      paymentFrequencyId: peLoan.paymentFrequencyId
        ? peLoan.paymentFrequencyId.toString()
        : 'null',
      securityId: peLoan.securityId ? peLoan.securityId.toString() : 'null',
      creditQuality: peLoan.creditQuality ? peLoan.creditQuality : 'null',
      status: peLoan.status ? peLoan.status : 'null',
      geography: peLoan.geography ? peLoan.geography : 'null'
    };
  }
}
