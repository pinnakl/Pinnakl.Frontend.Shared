import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { PnlCalculatedAttributeFromApi } from './pnl-calculated-attribute-from-api.model';
import { PnlCalculatedAttribute } from './pnl-calculated-attribute.model';

@Injectable()
export class PnlCalculatedAttributeService {
  private _pnlCalculatedAttributesEndpoint = 'entities/pnl_calculated_attributes';

  constructor(private readonly _wsp: WebServiceProvider) {}

  async getMany({
    accountId,
    endDate,
    startDate
  }: {
    accountId: number;
    endDate: Date;
    startDate: Date;
  }): Promise<PnlCalculatedAttribute[]> {
    const pnlCalculatedAttributesFromApi = await this._wsp.getHttp<PnlCalculatedAttributeFromApi[]>({
      endpoint: this._pnlCalculatedAttributesEndpoint,
      params: {
        filters: [
          { key: 'accountId', type: 'EQ', value: [accountId.toString()] },
          {
            key: 'endDate',
            type: 'EQ',
            value: [moment(endDate).format('MM/DD/YYYY')]
          },
          {
            key: 'startDate',
            type: 'EQ',
            value: [moment(startDate).format('MM/DD/YYYY')]
          }
        ]
      }
    });
    return pnlCalculatedAttributesFromApi.map(this._formatPnlCalculatedAttribute);
  }

  private _formatPnlCalculatedAttribute(
    entityFromApi: PnlCalculatedAttributeFromApi
  ): PnlCalculatedAttribute {
    // this._multiplier = this._multiplier * -1;
    const {
      attributeid,
      realizedpnl,
      securityid,
      totalpnl,
      unrealizedpnl,
      assettype,
      countryofincorporation,
      countryofrisk,
      coupon,
      description,
      dividend,
      identifier,
      sector,
      sectype,
      ticker,
      id,
      price,
      position,
      ...attributes
    } = entityFromApi;
    return {
      attributeId: +attributeid,
      realizedPnl: +realizedpnl,
      securityId: +securityid,
      totalPnl: +totalpnl,
      // totalPnl: (Math.random() * 10000 + 1) * this._multiplier,
      unrealizedPnl: +unrealizedpnl,
      position: +position,
      // position: Math.random() * 10000 + 1,
      // price: Math.random() * 10000 + 1,
      price: +price || 0,
      assetType: assettype,
      countryOfIncorporation: countryofincorporation,
      countryOfRisk: countryofrisk,
      coupon: isNaN(parseFloat(coupon)) ? 0 : parseFloat(coupon),
      dividend: isNaN(parseFloat(dividend)) ? 0 : parseFloat(dividend),
      secType: sectype,
      description,
      id: +id,
      identifier,
      sector,
      ticker,
      accruedInterest: 0,
      ...attributes
    } as PnlCalculatedAttribute;
  }
}
