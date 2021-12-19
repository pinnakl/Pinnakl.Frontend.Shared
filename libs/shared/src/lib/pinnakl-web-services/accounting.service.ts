import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { AUM, CapitalRatio, CashBalance } from '../models';
import { AccountService } from '@pnkl-frontend/shared';

@Injectable()
export class AccountingService {
  private readonly _aumEndpoint = 'entities/aum';
  private readonly _allAumsEndpoint = 'entities/all_aums';
  private readonly _accountCashEndpoint = 'entities/account_cash';
  private readonly _tradeAllocationRationsEndpoint =
    'entities/tradeallocationratios';

  constructor(
    private readonly wsp: WebServiceProvider,
    private readonly accountService: AccountService
  ) {}

  getAUMByAccountIdAndDate(accountId: string, date: Date): Promise<any> {
    const fields = ['id', 'AccountId', 'AUM', 'date'];
    return this.wsp.getHttp({
      endpoint: this._aumEndpoint,
      params: {
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
    });
  }

  getAUM(startDate: Date, endDate: Date = new Date()): Promise<AUM[]> {
    const fields = ['id', 'AccountId', 'AUM', 'date'];
    return this.wsp
      .getHttp<any[]>({
        endpoint: this._aumEndpoint,
        params: {
          fields: fields,
          filters: [
            {
              key: 'date',
              type: 'GE',
              value: [moment(startDate).format('MM/DD/YYYY')]
            },
            {
              key: 'date',
              type: 'LE',
              value: [moment(endDate).format('MM/DD/YYYY')]
            }
          ]
        }
      })
      .then(result => result.map(x => this.formatAUM(x)));
  }

  async getAllAUM(startDate: Date = new Date()): Promise<AUM[]> {
    const accounts = await this.accountService.getAccounts();

    const allAUM = await this.wsp.getHttp<any[]>({
      endpoint: this._allAumsEndpoint,
      params: {
        filters: [
          {
            key: 'date',
            type: 'EQ',
            value: [moment(startDate).format('MM/DD/YYYY')]
          }
        ]
      }
    });

    const aums = allAUM.map(this.formatAUM);
    aums.forEach(
      aum =>
        (aum.account = accounts.find(
          account => parseInt(account.id) === aum.accountId
        ))
    );

    return aums;
  }

  saveAUM(accountId: number, aum: number, date: Date): Promise<AUM> {
    return this.wsp
      .postHttp<any>({
        endpoint: this._aumEndpoint,
        body: {
          AccountId: accountId.toString(),
          AUM: aum.toString(),
          date: moment(date).format('MM/DD/YYYY')
        }
      })
      .then(x => this.formatAUM(x));
  }

  updateAUM(
    id: number,
    accountId: number,
    aum: number,
    date: Date
  ): Promise<AUM> {
    return this.wsp
      .putHttp<any>({
        endpoint: this._aumEndpoint,
        body: {
          id: id.toString(),
          AccountId: accountId.toString(),
          AUM: aum.toString(),
          date: moment(date).format('MM/DD/YYYY')
        }
      })
      .then(x => this.formatAUM(x));
  }

  deleteAUM(id: number): Promise<any> {
    return this.wsp.deleteHttp({
      endpoint: `${this._aumEndpoint}/${id}`
    });
  }

  async getCapitalRatios(
    startDate: Date,
    endDate: Date
  ): Promise<CapitalRatio[]> {
    const fields = [
      'id',
      'HierarchyType',
      'HierarchyName',
      'CapitalRatio',
      'StartDate',
      'EndDate'
    ];

    const capitalRatios = await this.wsp.getHttp<any[]>({
      endpoint: this._tradeAllocationRationsEndpoint,
      params: {
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
    });

    return capitalRatios.map(this.formatCapitalRatio);
  }

  async saveCapitalRatio(
    hierarchyName: string,
    hierarchyType: string,
    capitalRatio: number,
    startDate: Date,
    endDate: Date
  ): Promise<CapitalRatio> {
    const result = await this.wsp.postHttp<any>({
      endpoint: this._tradeAllocationRationsEndpoint,
      body: {
        HierarchyType: hierarchyType,
        HierarchyName: hierarchyName,
        CapitalRatio: capitalRatio.toString(),
        StartDate: moment(startDate).format('MM/DD/YYYY'),
        EndDate: moment(endDate).format('MM/DD/YYYY')
      }
    });

    return this.formatCapitalRatio(result);
  }

  async updateCapitalRatio(
    id: number,
    hierarchyName: string,
    hierarchyType: string,
    capitalRatio: number,
    startDate: Date,
    endDate: Date
  ): Promise<CapitalRatio> {
    const result = await this.wsp.putHttp<any>({
      endpoint: this._tradeAllocationRationsEndpoint,
      body: {
        id: id.toString(),
        HierarchyType: hierarchyType,
        HierarchyName: hierarchyName,
        CapitalRatio: capitalRatio.toString(),
        StartDate: moment(startDate).format('MM/DD/YYYY'),
        EndDate: moment(endDate).format('MM/DD/YYYY')
      }
    });

    return this.formatCapitalRatio(result);
  }

  confirmDeleteForCapitalRatio(startDate: Date): Promise<any> {
    return this.wsp.getHttp<any[]>({
      endpoint: 'entities/trade_requests',
      params: {
        fields: ['id'],
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
    });
  }

  async deleteCapitalRatio(id: number): Promise<any> {
    return this.wsp.deleteHttp({
      endpoint: `${this._tradeAllocationRationsEndpoint}/${id}`
    });
  }

  async getCashBal(date: Date): Promise<CashBalance[]> {
    const fields = [
      'id',
      'date',
      'accountid',
      'custodianid',
      'currency',
      'amount',
      'amountusd'
    ];

    const entities = await this.wsp.getHttp<any[]>({
      endpoint: this._accountCashEndpoint,
      params: {
        fields: fields,
        filters: [
          {
            key: 'date',
            type: 'EQ',
            value: [moment(date).format('MM/DD/YYYY')]
          }
        ]
      }
    });

    return entities.map(this.formatCashBalance);
  }

  async getCashBalancesFromDate(
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<CashBalance[]> {
    const fields = [
      'id',
      'date',
      'accountid',
      'custodianid',
      'currency',
      'amount',
      'amountusd',
      'cashtype'
    ];

    const cashBalances = await this.wsp.getHttp<any[]>({
      endpoint: this._accountCashEndpoint,
      params: {
        fields: fields,
        filters: [
          {
            key: 'date',
            type: 'GE',
            value: [moment(startDate).format('MM/DD/YYYY')]
          },
          {
            key: 'date',
            type: 'LE',
            value: [moment(endDate).format('MM/DD/YYYY')]
          }
        ]
      }
    });

    return cashBalances.map(this.formatCashBalance);
  }

  formatCashBalance(result: any): CashBalance {
    const id = +result.id;
    const accountId = +result.accountid;
    const custodianId = +result.custodianid;
    const currency = result.currency;
    const amount = +result.amount;
    const amountUSD = +result.amountusd;

    const cashBalance = new CashBalance(
      !isNaN(id) ? id : null,
      new Date(result.date),
      !isNaN(accountId) ? accountId : null,
      !isNaN(custodianId) ? custodianId : null,
      currency,
      !isNaN(amount) ? amount : null,
      !isNaN(amountUSD) ? amountUSD : null
    );

    cashBalance.cashType = result.cashtype;
    return cashBalance;
  }

  async saveCashBal(
    accountId: number,
    custodianId: number,
    date: Date,
    position: number,
    currencyId: number,
    cashType: string
  ): Promise<CashBalance> {
    const result = await this.wsp.postHttp<any>({
      endpoint: this._accountCashEndpoint,
      body: {
        accountid: accountId.toString(),
        custodianid: custodianId.toString(),
        date: moment(date).format('MM/DD/YYYY'),
        amount: position.toString(),
        currencyid: currencyId.toString(),
        cashtype: cashType.toUpperCase()
      }
    });

    return this.formatCashBalance(result);
  }

  async updateCashBal(
    id: number,
    accountId: number,
    custodianId: number,
    date: Date,
    position: number,
    currencyId: number,
    cashType: string
  ): Promise<CashBalance> {
    const body = {
      id: id.toString(),
      accountid: accountId.toString(),
      custodianid: custodianId.toString(),
      date: moment(date).format('MM/DD/YYYY'),
      amount: position.toString(),
      currencyId: currencyId.toString(),
      cashtype: cashType.toUpperCase()
    };
    const result = await this.wsp.putHttp({
      endpoint: this._accountCashEndpoint,
      body
    });

    return this.formatCashBalance(result);
  }

  async deleteCashBal(id: number): Promise<any> {
    return this.wsp.deleteHttp({
      endpoint: `${this._accountCashEndpoint}/${id}`
    });
  }

  private formatCapitalRatio(result: any): CapitalRatio {
    const id = parseInt(result.id, 10);
    const capitalRatio = parseFloat(result.capitalratio);
    return new CapitalRatio(
      !isNaN(id) ? id : null,
      result.hierarchytype,
      result.hierarchyname,
      !isNaN(capitalRatio) ? capitalRatio : null,
      new Date(result.startdate),
      new Date(result.enddate)
    );
  }

  public formatAUM(result: any): AUM {
    const id = parseInt(result.id, 10);
    const accountId = parseInt(result.accountid, 10);
    const aum = parseFloat(result.aum);
    const date = moment(result.date, 'MM/DD/YYYY');
    return new AUM(
      !isNaN(id) ? id : null,
      !isNaN(accountId) ? accountId : null,
      !isNaN(aum) ? aum : null,
      date.isValid() ? date.toDate() : null
    );
  }
}
