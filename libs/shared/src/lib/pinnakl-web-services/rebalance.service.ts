import { Injectable } from '@angular/core';

import * as moment from 'moment';

import {
  WebServiceProvider
} from '@pnkl-frontend/core';

@Injectable()
export class RebalanceService {
  private readonly _rebalancingEndpoint = 'entities/rebalancing';
  private _funds: any;
  constructor(private readonly wsp: WebServiceProvider) {}

  async getFundsDetails(): Promise<any> {
    if (this._funds) {
      return Promise.resolve(this._funds);
    }

    this._funds = await this.wsp.getHttp<any[]>({
      endpoint: 'entities/client_products',
      params: { fields: ['ClientId', 'Id', 'Name'] }
    });

    return this._funds;
  }

  async postRebalancedData(tradedate: Date, brokerId: number): Promise<any> {
    return this.wsp.postHttp({
      endpoint: this._rebalancingEndpoint,
      body: {
        brokerId: brokerId.toString(),
        tradeDate: moment(tradedate).format('MM/DD/YYYY'),
        tradeType: 'rebalance'
      }
    });
  }

  async postIvDvData(tradedate: Date, brokerId: number, ivdv: number): Promise<any> {
    return this.wsp.postHttp({
      endpoint: this._rebalancingEndpoint,
      body: {
        brokerId: brokerId.toString(),
        investment: ivdv.toString(),
        tradeDate: moment(tradedate).format('MM/DD/YYYY'),
        tradeType: 'rebalance'
      }
    });
  }

  async getRebalancedData(tradedate: Date): Promise<any> {
    const formatteddate = moment(tradedate).format('MM/DD/YYYY'),
      fields = [
        'AccountId',
        'AccountCode',
        'AssetType',
        'Description',
        'Identifier',
        'Price',
        'Quantity',
        'SecurityId',
        'Ticker',
        'TradeDate',
        'TranType'
      ];

    return this.wsp.getHttp<any[]>({
      endpoint: 'entities/rebalancing',
      params: {
        fields: fields,
        filters: [
          {
            key: 'TradeDate',
            type: 'EQ',
            value: [formatteddate]
          },
          {
            key: 'TradeType',
            type: 'EQ',
            value: ['rebalance']
          }
        ]
      }
    });
  }

  async getIvDvData(tradedate: Date): Promise<any> {
    const formatteddate = moment(tradedate).format('MM/DD/YYYY'),
      fields = [
        'AccountId',
        'AccountCode',
        'AssetType',
        'Description',
        'Identifier',
        'Price',
        'Quantity',
        'SecurityId',
        'Ticker',
        'TradeDate',
        'TranType'
      ];

    return this.wsp.getHttp<any[]>({
      endpoint: 'entities/rebalancing',
      params: {
        fields: fields,
        filters: [
          {
            key: 'TradeDate',
            type: 'EQ',
            value: [formatteddate]
          },
          {
            key: 'TradeType',
            type: 'EQ',
            value: ['cashflow']
          }
        ]
      }
    });
  }
}
