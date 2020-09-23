import { Injectable } from '@angular/core';
import * as moment from 'moment';

import {
  DeleteWebRequest,
  GetWebRequest,
  PostWebRequest,
  PutWebRequest,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { AUM } from '../models/aum.model';
import { CapitalRatio } from '../models/capital-ratio.model';
import { CashBalance } from '../models/cash-balance.model';

@Injectable()
export class AccountingService {
  private readonly AUM_URL = 'aum';
  private readonly CAPITAL_RATIO_URL = 'tradeallocationratios';
  private readonly CASH_BAL_URL = 'account_cash';

  constructor(private wsp: WebServiceProvider) {}

  getAUMByAccountIdAndDate(accountId: string, date: Date): Promise<any> {
    const fields = ['id', 'AccountId', 'AUM', 'date'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.AUM_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'date',
            type: 'LE',
            value: [moment(date).format('MM/DD/YYYY')]
          },
          {
            key: 'accountid',
            type: 'EQ',
            value: [accountId]
          },
          {
            key: '',
            type: 'TOP',
            value: ['2']
          }
        ],
        orderBy: [
          {
            field: 'date',
            direction: 'DESC'
          }
        ]
      }
    };
    return this.wsp.get(getWebRequest);
  }

  getAUM(startDate: Date): Promise<AUM[]> {
    const fields = ['id', 'AccountId', 'AUM', 'date'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.AUM_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'date',
            type: 'GE',
            value: [moment(startDate).format('MM/DD/YYYY')]
          }
        ]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then(result => result.map(x => this.formatAUM(x)));
  }

  private formatAUM(result: any): AUM {
    let id = parseInt(result.id);
    let accountId = parseInt(result.accountid);
    let aum = parseFloat(result.aum);
    let date = moment(result.date, 'MM/DD/YYYY');
    return new AUM(
      !isNaN(id) ? id : null,
      !isNaN(accountId) ? accountId : null,
      !isNaN(aum) ? aum : null,
      date.isValid() ? date.toDate() : null
    );
  }

  saveAUM(accountId: number, aum: number, date: Date): Promise<AUM> {
    const postWebRequest: PostWebRequest = {
      endPoint: this.AUM_URL,
      payload: {
        AccountId: accountId,
        AUM: aum,
        date: moment(date).format('MM/DD/YYYY')
      }
    };

    return this.wsp.post(postWebRequest).then(x => this.formatAUM(x));
  }

  updateAUM(
    id: number,
    accountId: number,
    aum: number,
    date: Date
  ): Promise<AUM> {
    const putWebRequest: PutWebRequest = {
      endPoint: this.AUM_URL,
      payload: {
        id: id,
        AccountId: accountId,
        AUM: aum,
        date: moment(date).format('MM/DD/YYYY')
      }
    };

    return this.wsp.put(putWebRequest).then(x => this.formatAUM(x));
  }

  deleteAUM(id: number): Promise<any> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: this.AUM_URL,
      payload: {
        id: id
      }
    };

    return this.wsp.delete(deleteWebRequest);
  }

  getCapitalRatios(startDate: Date, endDate: Date): Promise<CapitalRatio[]> {
    let fields = [
      'id',
      'HierarchyType',
      'HierarchyName',
      'CapitalRatio',
      'StartDate',
      'EndDate'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.CAPITAL_RATIO_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'StartDate',
            type: 'GE',
            value: [moment(startDate).format('MM/DD/YYYY')]
          },
          {
            key: 'EndDate',
            type: 'LE',
            value: [moment(endDate).format('MM/DD/YYYY')]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then(result => result.map(x => this.formatCapitalRatio(x)));
  }

  private formatCapitalRatio(result: any): CapitalRatio {
    let id = parseInt(result.id);
    let capitalRatio = parseFloat(result.capitalratio);
    return new CapitalRatio(
      !isNaN(id) ? id : null,
      result.hierarchytype,
      result.hierarchyname,
      !isNaN(capitalRatio) ? capitalRatio : null,
      new Date(result.startdate),
      new Date(result.enddate)
    );
  }

  saveCapitalRatio(
    hierarchyName: string,
    hierarchyType: string,
    CapitalRatio: number,
    startDate: Date,
    endDate: Date
  ): Promise<CapitalRatio> {
    const postWebRequest: PostWebRequest = {
      endPoint: this.CAPITAL_RATIO_URL,
      payload: {
        HierarchyType: hierarchyType,
        HierarchyName: hierarchyName,
        CapitalRatio: CapitalRatio,
        StartDate: moment(startDate).format('MM/DD/YYYY'),
        EndDate: moment(endDate).format('MM/DD/YYYY')
      }
    };

    return this.wsp
      .post(postWebRequest)
      .then(result => this.formatCapitalRatio(result));
  }

  updateCapitalRatio(
    id: number,
    hierarchyName: string,
    hierarchyType: string,
    CapitalRatio: number,
    startDate: Date,
    endDate: Date
  ): Promise<CapitalRatio> {
    const putWebRequest: PutWebRequest = {
      endPoint: this.CAPITAL_RATIO_URL,
      payload: {
        id: id,
        HierarchyType: hierarchyType,
        HierarchyName: hierarchyName,
        CapitalRatio: CapitalRatio,
        StartDate: moment(startDate).format('MM/DD/YYYY'),
        EndDate: moment(endDate).format('MM/DD/YYYY')
      }
    };

    return this.wsp
      .put(putWebRequest)
      .then(result => this.formatCapitalRatio(result));
  }

  confirmDeleteForCapitalRatio(startDate: Date): Promise<any> {
    let fields = ['id'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'trade_requests',
      options: {
        fields: fields,
        filters: [
          {
            key: 'tradedate',
            type: 'GE',
            value: [moment(startDate).format('MM/DD/YYYY')]
          },
          {
            key: '',
            type: 'TOP',
            value: ['1']
          }
        ]
      }
    };

    return this.wsp.get(getWebRequest);
  }

  deleteCapitalRatio(id: number): Promise<any> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: this.CAPITAL_RATIO_URL,
      payload: {
        id: id
      }
    };
    return this.wsp.delete(deleteWebRequest);
  }

  getCashBal(date: Date): Promise<CashBalance[]> {
    const fields = [
      'id',
      'date',
      'accountid',
      'custodianid',
      'currency',
      'amount',
      'amountusd'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.CASH_BAL_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'date',
            type: 'EQ',
            value: [moment(date).format('MM/DD/YYYY')]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then(result => result.map(x => this.formatCashBalance(x)));
  }

  getCashBalancesFromDate(startDate: Date): Promise<CashBalance[]> {
    const fields = [
      'id',
      'date',
      'accountid',
      'custodianid',
      'currency',
      'amount',
      'amountusd'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.CASH_BAL_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'date',
            type: 'GE',
            value: [moment(startDate).format('MM/DD/YYYY')]
          }
        ]
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then(result => result.map(x => this.formatCashBalance(x)));
  }

  private formatCashBalance(result: any): CashBalance {
    const id = +result.id;
    const accountId = +result.accountid;
    const custodianId = +result.custodianid;
    const currency = result.currency;
    const amount = +result.amount;
    const amountUSD = +result.amountusd;

    return new CashBalance(
      !isNaN(id) ? id : null,
      new Date(result.date),
      !isNaN(accountId) ? accountId : null,
      !isNaN(custodianId) ? custodianId : null,
      currency,
      !isNaN(amount) ? amount : null,
      !isNaN(amountUSD) ? amountUSD : null
    );
  }

  saveCashBal(
    accountId: number,
    custodianId: number,
    date: Date,
    position: number,
    currencyId: number
  ): Promise<CashBalance> {
    const postWebRequest: PostWebRequest = {
      endPoint: this.CASH_BAL_URL,
      payload: {
        accountid: accountId,
        custodianid: custodianId,
        date: moment(date).format('MM/DD/YYYY'),
        amount: position,
        currencyid: currencyId,
      }
    };

    return this.wsp
      .post(postWebRequest)
      .then(result => this.formatCashBalance(result));
  }

  updateCashBal(
    id: number,
    accountId: number,
    custodianId: number,
    date: Date,
    position: number,
    currencyId: number
  ): Promise<CashBalance> {
    const putWebRequest: PutWebRequest = {
      endPoint: this.CASH_BAL_URL,
      payload: {
        id: id,
        accountid: accountId,
        custodianid: custodianId,
        date: moment(date).format('MM/DD/YYYY'),
        amount: position,
        currencyId: currencyId
      }
    };

    return this.wsp
      .put(putWebRequest)
      .then(result => this.formatCashBalance(result));
  }

  deleteCashBal(id: number): Promise<any> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: this.CASH_BAL_URL,
      payload: {
        id: id
      }
    };
    return this.wsp.delete(deleteWebRequest);
  }
}
