import { Injectable } from '@angular/core';
import { WebServiceProvider } from '@pnkl-frontend/core';
import * as moment from 'moment';
import { PeLoan, PeLoanApi } from '../../models';

@Injectable()
export class PeloanService {
  private readonly _peLoansEndpoint = 'entities/pe_loans';

  constructor(private readonly wsp: WebServiceProvider) { }

  async postLoan(peLoan: PeLoan): Promise<PeLoan> {
    const entity = await this.wsp.postHttp<PeLoanApi>({
      endpoint: this._peLoansEndpoint,
      body: this.formatLoanData(peLoan)
    });

    return this.formatPeLoanApi(entity);
  }

  async getPeLoanDetailsById(id: number): Promise<PeLoan> {
    const entities = await this.wsp.getHttp<PeLoanApi[]>({
      endpoint: this._peLoansEndpoint,
      params: {
        fields: ['*'],
        filters: [
          {
            key: 'id',
            type: 'EQ',
            value: [id.toString()]
          }
        ]
      }
    });

    return entities?.length ? this.formatPeLoanApi(entities[0]) : null;
  }

  async putLoan(peLoan: PeLoan): Promise<PeLoan> {
    const entity = await this.wsp.putHttp<PeLoanApi>({
      endpoint: this._peLoansEndpoint,
      body: this.fromPutLoanPayload(peLoan)
    });

    return this.formatPeLoanApi(entity);
  }

  fromPutLoanPayload(peLoan: PeLoan): any {
    const formattedLoanData = {};

    for (const key in peLoan) {
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

  async getPeLoanFromSecurityId(securityId: number): Promise<PeLoan> {
    if (!securityId) {
      return Promise.resolve({} as PeLoan);
    }

    const entities = await this.wsp.getHttp<PeLoanApi[]>({
      endpoint: this._peLoansEndpoint,
      params: {
        fields: ['*'],
        filters: [
          {
            key: 'securityId',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    });

    return entities?.length ? this.formatPeLoanApi(entities[0]) : null;
  }

  formatPeLoanApi(entity: PeLoanApi): PeLoan {
    return {
      accruingIndicator: entity.accruingindicator ? entity.accruingindicator === 'True' : null,
      couponRate: entity.couponrate ? parseFloat(entity.couponrate) : null,
      couponTypeId: entity.coupontypeid ? parseInt(entity.coupontypeid, 10) : null,
      couponType: entity.coupontype,
      firstAccrualDate: entity.firstaccrualdate
        ? moment(entity.firstaccrualdate, 'MM/DD/YYYY').toDate()
        : null,
      firstCouponDate: entity.firstcoupondate
        ? moment(entity.firstcoupondate, 'MM/DD/YYYY').toDate()
        : null,
      id: parseInt(entity.id, 10),
      interestBasisId: entity.interestbasisid
        ? parseInt(entity.interestbasisid, 10)
        : null,
      faceAmount: entity.faceamount ? parseInt(entity.faceamount, 10) : null,
      maturityDate: entity.maturitydate
        ? moment(entity.maturitydate, 'MM/DD/YYYY').toDate()
        : null,
      paymentFrequencyId: entity.paymentfrequencyid
        ? parseInt(entity.paymentfrequencyid, 10)
        : null,
      paymentFrequency: entity.paymentfrequency,
      securityId: entity.securityid ? parseInt(entity.securityid, 10) : null,
      creditQuality: entity.creditquality ? entity.creditquality : null,
      status: entity.status ? entity.status : null,
      geography: entity.geography ? entity.geography : null
    };
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
