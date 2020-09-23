import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { GetWebRequest, PostWebRequest, WebServiceProvider } from '@pnkl-frontend/core';

@Injectable()
export class RebalanceService {
  private readonly REBALANCE_URL = '/rebalancing';
  private _funds: any;
  constructor(private wsp: WebServiceProvider) {}

  getFundsDetails(): Promise<any> {
    if (this._funds) {
      return Promise.resolve(this._funds);
    }
    const fields = ['ClientId', 'Id', 'Name'],
      getWebRequest: GetWebRequest = {
        endPoint: '/client_products',
        options: { fields }
      };
    return this.wsp.get(getWebRequest).then(results => {
      this._funds = results;
      return this._funds;
    });
  }

  postRebalancedData(tradedate: Date, brokerId: number): Promise<any> {
    const requestBody = {
        brokerId: brokerId,
        tradeDate: moment(tradedate).format('MM/DD/YYYY'),
        tradeType: 'rebalance'
      },
      postWebRequest: PostWebRequest = {
        endPoint: this.REBALANCE_URL,
        payload: requestBody
      };
    return this.wsp.post(postWebRequest);
  }

  postIvDvData(tradedate: Date, brokerId: number, ivdv: number): Promise<any> {
    const requestBody = {
        brokerId: brokerId,
        investment: ivdv,
        tradeDate: moment(tradedate).format('MM/DD/YYYY'),
        tradeType: 'rebalance'
      },
      postWebRequest: PostWebRequest = {
        endPoint: this.REBALANCE_URL,
        payload: requestBody
      };
    return this.wsp.post(postWebRequest);
  }

  getRebalancedData(tradedate: Date): Promise<any> {
    let formatteddate = moment(tradedate).format('MM/DD/YYYY'),
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
    const getWebRequest: GetWebRequest = {
      endPoint: '/rebalancing',
      options: {
        fields,
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
    };
    return this.wsp.get(getWebRequest);
  }

  getIvDvData(tradedate: Date): Promise<any> {
    let formatteddate = moment(tradedate).format('MM/DD/YYYY'),
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
    const getWebRequest: GetWebRequest = {
      endPoint: '/rebalancing',
      options: {
        fields,
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
    };
    return this.wsp.get(getWebRequest);
  }
}
