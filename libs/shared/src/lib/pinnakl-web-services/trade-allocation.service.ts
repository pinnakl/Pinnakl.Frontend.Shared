import { Injectable } from '@angular/core';
import { TradeAllocation } from '../models/oms';

// Third party libs
import * as moment from 'moment';

// Models
import { GetHttpRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { PbAccountFromApi } from '../models/pb-account-from-api.model';
import { PBAccount, PBSubAccount } from '../models';

// Services

@Injectable()
export class TradeAllocationService {
  private readonly _pbaccountsEndpoint = 'entities/pbaccounts';
  private readonly _tradeRequestsEndpoint = 'entities/trade_requests';
  private readonly _tradeAllocationsOMSEndpoint =
    'entities/trade_allocation_oms';
  private readonly _pbSubAccountsEndpoint = 'entities/pb_sub_accounts';
  private readonly _tradeAllocationsEndpoint = 'entities/trade_allocations';
  private readonly _tradeAllocationsSuggestedEndpoint =
    'entities/trade_allocations_suggested';
  private readonly Max_Integer = 2147483647;

  constructor(private readonly wsp: WebServiceProvider) {}

  async getPBAccountsByAccountType(
    accountTypes?: string,
    accountIds?: number[]
  ): Promise<PBAccount[]> {
    const filters = [];
    const fields = [
      'id',
      'accountid',
      'accountcode',
      'accounttype',
      'custodianid',
      'custodiancode',
      'custodianaccountnum',
      'custodianname'
    ];
    if (accountTypes !== undefined) {
      filters.push({
        key: 'accounttype',
        type: 'IN',
        value: [accountTypes]
      });
    }

    if (accountIds && accountIds.length > 0) {
      filters.push({
        key: 'AccountId',
        type: 'IN',
        value: accountIds
      });
    }

    const getWebRequest: GetHttpRequest = {
      endpoint: this._pbaccountsEndpoint,
      params: {
        fields: fields
      }
    };

    if (filters.length > 0) {
      getWebRequest.params['filters'] = filters;
    }

    const adminAccounts = await this.wsp.getHttp<PbAccountFromApi[]>(
      getWebRequest
    );

    return adminAccounts.map(this.formatPbAccount);
  }

  public formatPbAccount(account: PbAccountFromApi): PBAccount {
    const accountId = +account.accountid,
      custodianId = +account.custodianid,
      id = +account.id;
    return {
      accountCode: account.accountcode,
      accountId: !isNaN(accountId) ? accountId : null,
      accountType: account.accounttype,
      custodianAccountNumber: account.custodianaccountnum,
      custodianCode: account.custodiancode,
      custodianId: !isNaN(custodianId) ? custodianId : null,
      custodianName: account.custodianname,
      id: !isNaN(id) ? id : null
    };
  }

  async getSubAccounts(): Promise<PBSubAccount[]> {
    const subaccounts = await this.wsp.getHttp<any[]>({
      endpoint: this._pbSubAccountsEndpoint,
      params: {
        fields: ['id', 'custodiancode', 'accountid', 'pbaccountid', 'code']
      }
    });

    return subaccounts.map(
      subaccount =>
        new PBSubAccount(
          +subaccount.id,
          +subaccount.accountid,
          subaccount.custodiancode,
          +subaccount.pbaccountid,
          subaccount.code
        )
    );
  }

  async savePBAccounts(
    accountId: number,
    accountType: string,
    custodianId: number,
    custodianAccountNum: number,
    activeIndicator: boolean
  ): Promise<PBAccount> {
    const result = await this.wsp.postHttp<PbAccountFromApi>({
      endpoint: this._pbaccountsEndpoint,
      body: {
        accountid: accountId,
        accounttype: accountType,
        custodianid: custodianId,
        custodianaccountnum: custodianAccountNum,
        active_indicator: activeIndicator
      }
    });

    return this.formatPbAccount(result);
  }

  async updatePBAccounts(
    id: number,
    accountId: number,
    accountType: string,
    custodianId: number,
    custodianAccountNum: number,
    activeIndicator: boolean
  ): Promise<PBAccount> {
    const result = await this.wsp.putHttp<PbAccountFromApi>({
      endpoint: this._pbaccountsEndpoint,
      body: {
        id: id,
        accountid: accountId,
        accounttype: accountType,
        custodianid: custodianId,
        custodianaccountnum: custodianAccountNum,
        active_indicator: activeIndicator
      }
    });

    return this.formatPbAccount(result);
  }

  async deletePBAccounts(id: number): Promise<any> {
    return this.wsp.deleteHttp({
      endpoint: `${this._pbaccountsEndpoint}/${id}`
    });
  }

  async getAllocations(
    tradeDate: Date,
    securityId: number,
    tranType: string,
    quantity: number,
    allocationType: string,
    hierarchyType: string,
    accountsStr: string,
    minIncrement: number
  ): Promise<any> {
    const getWebRequest: GetHttpRequest = {
      endpoint: this._tradeAllocationsSuggestedEndpoint,
      params: {
        filters: [
          {
            key: 'tradedate',
            type: 'EQ',
            value: [moment(tradeDate).format('MM/DD/YYYY')]
          },
          {
            key: 'allocationtype',
            type: 'EQ',
            value: ['into']
          },
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityId.toString()]
          },
          {
            key: 'tradequantity',
            type: 'EQ',
            value: [quantity.toString()]
          },
          {
            key: 'trantype',
            type: 'EQ',
            value: [tranType.toString()]
          },
          {
            key: 'hierarchytype',
            type: 'EQ',
            value: [hierarchyType]
          },
          {
            key: 'hierarchynamesinallocation',
            type: 'EQ',
            value: [accountsStr]
          },
          {
            key: 'minincrement',
            type: 'EQ',
            value: [minIncrement.toString()]
          }
        ]
      }
    };

    return this.wsp.getHttp(getWebRequest);
  }

  async getActualAllocations(
    tradeRequestId: number
  ): Promise<TradeAllocation[]> {
    if (tradeRequestId) {
      const fields = [
        'id',
        'traderequestid',
        'accountid',
        'custodianid',
        'quantity',
        'subaccountid'
      ];

      const result = await this.wsp.getHttp<any[]>({
        endpoint: this._tradeAllocationsEndpoint,
        params: {
          fields: fields,
          filters: [
            {
              key: 'traderequestid',
              type: 'EQ',
              value: [tradeRequestId.toString()]
            }
          ]
        }
      });

      return result.map(o => ({
        id: +o['id'],
        tradeId: +o['traderequestid'],
        accountId: +o['accountid'],
        custodianId: +o['custodianid'],
        quantity: +o['quantity'],
        subAccountId: +o['subaccountid']
      }));
    }
  }

  async deleteAllocationsFromTradeRequestId(
    tradeRequestId: number
  ): Promise<any> {
    return this.wsp.deleteHttp({
      endpoint: `${this._tradeAllocationsOMSEndpoint}/${tradeRequestId}`
    });
  }

  async saveFolder(
    tradeRequestId: number,
    customAttribId: number
  ): Promise<any> {
    return this.wsp.putHttp({
      endpoint: this._tradeRequestsEndpoint,
      body: {
        id: tradeRequestId.toString(),
        customAttribId: customAttribId.toString()
      }
    });
  }

  async deleteAllocation(tradeAllocation: TradeAllocation): Promise<any> {
    return this.wsp.deleteHttp({
      endpoint: `${this._tradeAllocationsEndpoint}/${tradeAllocation.id}`
    });
  }

  async saveAllocation(tradeAllocation: TradeAllocation): Promise<any> {
    const payload = {
      tradeId: tradeAllocation.tradeId.toString(),
      accountId: tradeAllocation.accountId.toString(),
      custodianId: tradeAllocation.custodianId.toString(),
      quantity: tradeAllocation.quantity.toString()
    };

    if (tradeAllocation.subAccountId) {
      payload['subAccountId'] = tradeAllocation.subAccountId.toString();
    }

    return this.wsp.postHttp({
      endpoint: this._tradeAllocationsEndpoint,
      body: payload
    });
  }

  getPositions(
    secId: number,
    maxTradeRequestId: number = this.Max_Integer
  ): Promise<any> {
    return this.wsp.getHttp({
      endpoint: 'entities/positions',
      params: {
        fields: [],
        filters: [
          {
            key: 'securityid',
            type: 'EQ',
            value: [secId.toString()]
          },
          {
            key: 'maxTradeRequestId',
            type: 'EQ',
            value: [maxTradeRequestId.toString()]
          }
        ]
      }
    });
  }
}
