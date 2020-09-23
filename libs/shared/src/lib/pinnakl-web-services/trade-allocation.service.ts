import { Injectable } from '@angular/core';
import { TradeAllocation } from './../models/oms/trade-allocation.model';

// Third party libs
import * as _ from 'lodash';
import * as moment from 'moment';

// Models
import {
  DeleteWebRequest,
  GetWebRequest,
  PostWebRequest,
  PutWebRequest,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { PbAccountFromApi } from '../models/pb-account-from-api.model';
import { PBAccount, PBSubAccount } from '../models/pb-account.model';

// Services

@Injectable()
export class TradeAllocationService {
  private readonly RESOURCE_URL = 'pbaccounts';
  private readonly TRADE_ALLOCATIONS_API_URL = 'trade_allocations';
  private readonly SUB_ACCOUNTS_RESOURCE_URL = 'pb_sub_accounts';
  private readonly SUGGESTED_ALLOCATIONS_API_URL =
    'trade_allocations_suggested';
  constructor(private wsp: WebServiceProvider) {}

  getPBAccountsByAccountType(
    accountTypes?: string,
    accountIds?: number[]
  ): Promise<PBAccount[]> {
    const filters = [];
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
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: fields
      }
    };

    if (filters.length > 0) {
      getWebRequest.options['filters'] = filters;
    }

    return this.wsp
      .get(getWebRequest)
      .then((adminAccounts: PbAccountFromApi[]) =>
        adminAccounts.map(adminAccount => this.formatPbAccount(adminAccount))
      );
  }

  private formatPbAccount(account: PbAccountFromApi): PBAccount {
    let accountId = parseInt(account.accountid),
      custodianAccountNumber = parseInt(account.custodianaccountnum),
      custodianId = parseInt(account.custodianid),
      id = parseInt(account.id);
    return {
      accountCode: account.accountcode,
      accountId: !isNaN(accountId) ? accountId : null,
      accountType: account.accounttype,
      custodianAccountNumber: !isNaN(custodianAccountNumber)
        ? custodianAccountNumber
        : null,
      custodianCode: account.custodiancode,
      custodianId: !isNaN(custodianId) ? custodianId : null,
      custodianName: account.custodianname,
      id: !isNaN(id) ? id : null
    };
  }

  getSubAccounts(): Promise<PBSubAccount[]> {
    const fields = ['id', 'custodiancode', 'accountid', 'pbaccountid', 'code'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.SUB_ACCOUNTS_RESOURCE_URL,
      options: {
        fields: fields
      }
    };

    return this.wsp
      .get(getWebRequest)
      .then(subaccounts =>
        subaccounts.map(
          subaccount =>
            new PBSubAccount(
              +subaccount.id,
              +subaccount.accountid,
              subaccount.custodiancode,
              +subaccount.pbaccountid,
              subaccount.code
            )
        )
      );
  }
  savePBAccounts(
    accountId: number,
    accountType: string,
    custodianId: number,
    custodianAccountNum: number,
    activeIndicator: boolean
  ): Promise<PBAccount> {
    const postWebRequest: PostWebRequest = {
      endPoint: 'pbaccounts',
      payload: {
        accountid: accountId,
        accounttype: accountType,
        custodianid: custodianId,
        custodianaccountnum: custodianAccountNum,
        active_indicator: activeIndicator
      }
    };

    return this.wsp
      .post(postWebRequest)
      .then(result => this.formatPbAccount(result));
  }

  updatePBAccounts(
    id: number,
    accountId: number,
    accountType: string,
    custodianId: number,
    custodianAccountNum: number,
    activeIndicator: boolean
  ): Promise<PBAccount> {
    const postWebRequest: PostWebRequest = {
      endPoint: 'pbaccounts',
      payload: {
        id: id,
        accountid: accountId,
        accounttype: accountType,
        custodianid: custodianId,
        custodianaccountnum: custodianAccountNum,
        active_indicator: activeIndicator
      }
    };

    return this.wsp
      .put(postWebRequest)
      .then(result => this.formatPbAccount(result));
  }

  deletePBAccounts(id: number): Promise<any> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: 'pbaccounts',
      payload: {
        id: id.toString()
      }
    };
    return this.wsp.delete(deleteWebRequest);
  }

  getAllocations(
    tradeDate: Date,
    securityId: number,
    tranType: string,
    quantity: number,
    allocationType: string,
    hierarchyType: string,
    accountsStr: string
  ): any {
    const getWebRequest: GetWebRequest = {
      endPoint: this.SUGGESTED_ALLOCATIONS_API_URL,
      options: {
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
          }
        ]
      }
    };
    return this.wsp.get(getWebRequest);
  }

  getActualAllocations(tradeRequestId: number): Promise<TradeAllocation[]> {
    if (tradeRequestId) {
      const fields = [
        'id',
        'traderequestid',
        'accountid',
        'custodianid',
        'quantity',
        'subaccountid'
      ];
      const getWebRequest: GetWebRequest = {
        endPoint: 'trade_allocations',
        options: {
          fields: fields,
          filters: [
            {
              key: 'traderequestid',
              type: 'EQ',
              value: [tradeRequestId.toString()]
            }
          ]
        }
      };

      return this.wsp.get(getWebRequest).then(result => {
        return result.map(o => {
          return {
            id: +o['id'],
            tradeId: +o['traderequestid'],
            accountId: +o['accountid'],
            custodianId: +o['custodianid'],
            quantity: +o['quantity'],
            subAccountId: +o['subaccountid']
          };
        });
      });
    }
  }

  deleteAllocationsFromTradeRequestId(tradeRequestId: number): Promise<any> {
    if (tradeRequestId) {
      return this.getActualAllocations(tradeRequestId).then(
        (allocations: TradeAllocation[]) => {
          return this.deleteAllocationList(allocations);
        }
      );
    }
  }

  deleteAllocationList(tradeAllocationArr: TradeAllocation[]): Promise<any> {
    let delPromsise = this.deleteAllocation(tradeAllocationArr[0]);

    for (let i = 1; i < tradeAllocationArr.length; i++) {
      delPromsise = delPromsise.then(result => {
        this.deleteAllocation(tradeAllocationArr[i]);
      });
    }
    return delPromsise;
  }

  saveFolder(tradeRequestId: number, customAttribId: number): Promise<any> {
    const putWebRequest: PutWebRequest = {
      endPoint: 'TRADE_REQUESTS',
      payload: {
        id: tradeRequestId,
        customAttribId: customAttribId
      }
    };

    return this.wsp.put(putWebRequest);
  }

  deleteAllocation(tradeAllocation: TradeAllocation): Promise<any> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: this.TRADE_ALLOCATIONS_API_URL,
      payload: {
        id: tradeAllocation.id
      }
    };

    return this.wsp.delete(deleteWebRequest);
  }

  saveAllocation(tradeAllocation: TradeAllocation): Promise<any> {
    const postWebRequest: PostWebRequest = {
      endPoint: this.TRADE_ALLOCATIONS_API_URL,
      payload: {
        tradeId: tradeAllocation.tradeId,
        accountId: tradeAllocation.accountId,
        custodianId: tradeAllocation.custodianId,
        quantity: tradeAllocation.quantity
      }
    };

    if (tradeAllocation.subAccountId) {
      postWebRequest.payload['subAccountId'] = tradeAllocation.subAccountId;
    }
    return this.wsp.post(postWebRequest);
  }
}
