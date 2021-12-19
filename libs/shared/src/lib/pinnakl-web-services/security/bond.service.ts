import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { Bond, BondFromApi } from '../../models';

@Injectable()
export class BondService {
  private readonly _entitiesBondsEndpoint = 'entities/bonds';

  constructor(private readonly wsp: WebServiceProvider) {}

  async getBondFromSecurityId(securityId: number): Promise<Bond> {
    const fields = [
      'Accruing_Indicator',
      'Bond144a_Indicator',
      'Call_Indicator',
      'Convertible_Indicator',
      'Coupon_Rate',
      'Coupon_Type',
      'Default_Indicator',
      'First_Accrual_Date',
      'First_Coupon_Date',
      'Id',
      'Interest_Basis',
      'Issue_Amount',
      'Maturity_Date',
      'Min_Piece',
      'Nominal_Value',
      'Outstanding_Amount',
      'Payment_Frequency',
      'Pik_Indicator',
      'Principal_Factor',
      'Put_Indicator',
      'SecurityId',
      'Sink_Indicator',
      'Strippable_Indicator',
      'UnderlyingSecurityId'
    ];

    const entities = await this.wsp.getHttp<BondFromApi[]>({
      endpoint: this._entitiesBondsEndpoint,
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

    return entities.length === 0 ? null : this.formatBond(entities[0]);
  }

  async getBondCouponsFromSecurityIds(securityIds: number[]): Promise<any> {
    const entities = await this.wsp.getHttp<any[]>({
      endpoint: this._entitiesBondsEndpoint,
      params: {
        fields: ['Coupon_Rate', 'Coupon_Type', 'SecurityId'],
        filters: [
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityIds.toString()]
          }
        ]
      }
    });

    return entities.length === 0 ? null : entities;
  }

  async postBond(entityToSave: Bond): Promise<Bond> {
    const entity = await this.wsp.postHttp<BondFromApi>({
      endpoint: this._entitiesBondsEndpoint,
      body: this.getBondForServiceRequest(entityToSave)
    });

    return this.formatBond(entity);
  }

  async putBond(entityToSave: Bond): Promise<Bond> {
    const entity = await this.wsp.putHttp<BondFromApi>({
      endpoint: this._entitiesBondsEndpoint,
      body: this.getBondForServiceRequest(entityToSave)
    });

    return this.formatBond(entity);
  }

  formatBond(entity: BondFromApi): Bond {
    let couponRate = parseFloat(entity.coupon_rate),
      couponTypeId = parseInt(entity.coupon_type),
      firstAccrualDateMoment = moment(entity.first_accrual_date, 'MM/DD/YYYY'),
      firstCouponDateMoment = moment(entity.first_coupon_date, 'MM/DD/YYYY'),
      id = parseInt(entity.id),
      interestBasisId = parseInt(entity.interest_basis),
      issueAmount = parseFloat(entity.issue_amount),
      maturityDateMoment = moment(entity.maturity_date, 'MM/DD/YYYY'),
      minPiece = parseFloat(entity.min_piece),
      nominalValue = parseFloat(entity.nominal_value),
      outstandingAmount = parseFloat(entity.outstanding_amount),
      paymentFrequencyId = parseInt(entity.payment_frequency),
      principalFactor = parseFloat(entity.principal_factor),
      securityId = parseInt(entity.securityid),
      underlyingSecurityId = parseInt(entity.underlyingsecurityid);
    return new Bond(
      entity.accruing_indicator === 'True',
      entity.bond144a_indicator === 'True',
      entity.call_indicator === 'True',
      entity.convertible_indicator === 'True',
      !isNaN(couponRate) ? couponRate : null,
      !isNaN(couponTypeId) ? couponTypeId : null,
      entity.default_indicator === 'True',
      firstAccrualDateMoment.isValid() ? firstAccrualDateMoment.toDate() : null,
      firstCouponDateMoment.isValid() ? firstCouponDateMoment.toDate() : null,
      !isNaN(id) ? id : null,
      !isNaN(interestBasisId) ? interestBasisId : null,
      !isNaN(issueAmount) ? issueAmount : null,
      maturityDateMoment.isValid() ? maturityDateMoment.toDate() : null,
      !isNaN(minPiece) ? minPiece : null,
      !isNaN(nominalValue) ? nominalValue : null,
      !isNaN(outstandingAmount) ? outstandingAmount : null,
      !isNaN(paymentFrequencyId) ? paymentFrequencyId : null,
      entity.pik_indicator === 'True',
      !isNaN(principalFactor) ? principalFactor : null,
      entity.put_indicator === 'True',
      !isNaN(securityId) ? securityId : null,
      entity.sink_indicator === 'True',
      entity.strippable_indicator === 'True',
      !isNaN(underlyingSecurityId) ? underlyingSecurityId : null
    );
  }

  private getBondForServiceRequest(entity: Bond): BondFromApi {
    let entityForApi = {} as BondFromApi,
      {
        accruingIndicator,
        bond144aIndicator,
        callIndicator,
        convertibleIndicator,
        couponRate,
        couponTypeId,
        defaultIndicator,
        firstAccrualDate,
        firstCouponDate,
        id,
        interestBasisId,
        issueAmount,
        maturityDate,
        minPiece,
        nominalValue,
        outstandingAmount,
        paymentFrequencyId,
        pikIndicator,
        principalFactor,
        putIndicator,
        securityId,
        sinkIndicator,
        strippableIndicator,
        underlyingSecurityId
      } = entity;
    if (accruingIndicator !== undefined) {
      entityForApi.accruing_indicator = accruingIndicator ? '1' : '0';
    }
    if (bond144aIndicator !== undefined) {
      entityForApi.bond144a_indicator = bond144aIndicator ? '1' : '0';
    }
    if (callIndicator !== undefined) {
      entityForApi.call_indicator = callIndicator ? '1' : '0';
    }
    if (convertibleIndicator !== undefined) {
      entityForApi.convertible_indicator = convertibleIndicator ? '1' : '0';
    }
    // if (couponRate !== undefined) {
    //   entityForApi.coupon_rate = couponRate.toString();
    // }
    if (couponTypeId !== undefined) {
      entityForApi.coupon_type = couponTypeId.toString();
    }
    if (defaultIndicator !== undefined) {
      entityForApi.default_indicator = defaultIndicator ? '1' : '0';
    }
    if (firstAccrualDate !== undefined) {
      entityForApi.first_accrual_date =
        firstAccrualDate !== null
          ? moment(firstAccrualDate).format('MM/DD/YYYY')
          : 'null';
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
      entityForApi.interest_basis = interestBasisId.toString();
    }
    if (issueAmount !== undefined) {
      entityForApi.issue_amount =
        issueAmount !== null ? issueAmount.toString() : 'null';
    }
    if (maturityDate !== undefined) {
      entityForApi.maturity_date = moment(maturityDate).format('MM/DD/YYYY');
    }
    if (minPiece !== undefined) {
      entityForApi.min_piece = minPiece.toString();
    }
    if (nominalValue !== undefined) {
      entityForApi.nominal_value = nominalValue.toString();
    }
    if (outstandingAmount !== undefined) {
      entityForApi.outstanding_amount =
        outstandingAmount !== null ? outstandingAmount.toString() : 'null';
    }
    if (paymentFrequencyId !== undefined) {
      entityForApi.payment_frequency = paymentFrequencyId.toString();
    }
    if (pikIndicator !== undefined) {
      entityForApi.pik_indicator = pikIndicator ? '1' : '0';
    }
    if (principalFactor !== undefined) {
      entityForApi.principal_factor =
        principalFactor != null ? principalFactor.toString() : 'null';
    }
    if (putIndicator !== undefined) {
      entityForApi.put_indicator = putIndicator ? '1' : '0';
    }
    if (securityId !== undefined) {
      entityForApi.securityid = securityId.toString();
    }
    if (sinkIndicator !== undefined) {
      entityForApi.sink_indicator = sinkIndicator ? '1' : '0';
    }
    if (strippableIndicator !== undefined) {
      entityForApi.strippable_indicator = strippableIndicator ? '1' : '0';
    }
    if (underlyingSecurityId !== undefined) {
      entityForApi.underlyingsecurityid =
        underlyingSecurityId !== null
          ? underlyingSecurityId.toString()
          : 'null';
    }
    return entityForApi;
  }
}
