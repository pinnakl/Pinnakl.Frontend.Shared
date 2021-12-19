import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { BehaviorSubject } from 'rxjs';
import {
  SecurityPriceAlert,
  SecurityPriceAlertPayload,
  WatchlistItem
} from '../models';
import { ReconciliationPosition } from '../models/recon';
import { ReconciliationPositionFromApi } from '../models/recon/reconciliation-position-from-api.model';

@Injectable()
export class PositionService {
  private readonly PNL_URL = 'entities/pnl_per_security';
  private readonly POSITION_SUMMARY = 'entities/positions_mv';
  private readonly TRADE_REQUEST_URL = 'entities/trade_requests';
  private readonly RECONCILIATION_RESOURCE_URL = 'entities/recon';
  private readonly WATCH_LIST_ITEMS_URL = 'entities/watch_list_items';
  private readonly EXTERNAL_POSITIONS_RESOURCE_URL = 'entities/extpos';
  private readonly PRICE_CHART_URL = 'entities/security_price_timeseries';
  private readonly POSITION_CHART_URL = 'entities/security_position_timeseries';
  private readonly SECURITY_PRICE_ALERTS_URL = 'entities/security_price_alerts';
  private readonly TRADE_ALLOCATION = 'entities/trade_allocations';

  selectedPositionPopupAccount$ = new BehaviorSubject<any>(null);

  constructor(private readonly wsp: WebServiceProvider) {}

  async getPositions(
    accountId: number,
    entityId: number,
    reconciliationDate: Date
  ): Promise<ReconciliationPosition[]> {
    const positions = await this.wsp.getHttp<ReconciliationPositionFromApi[]>({
      endpoint: this.RECONCILIATION_RESOURCE_URL,
      params: {
        filters: [
          {
            key: 'posdate',
            type: 'EQ',
            value: [moment(reconciliationDate).format('MM/DD/YYYY')]
          },
          {
            key: 'extentityid',
            type: 'EQ',
            value: [entityId.toString()]
          },
          {
            key: 'accountid',
            type: 'EQ',
            value: [accountId.toString()]
          },
          {
            key: 'comparisontype',
            type: 'IN',
            value: ['matches', 'diff', 'unmatch']
          }
        ]
      }
    });

    return positions.map(this.formatRecon);

    // TODO Use when will be fixed on backend
    // return this.wsp
    //   .getHttp<ReconciliationPositionFromApi[]>({
    //     endpoint: this.RECONCILIATION_RESOURCE_URL,
    //     params: {
    //       filters: [
    //         {
    //           key: 'posdate',
    //           type: 'EQ',
    //           value: [moment(reconciliationDate).format('MM/DD/YYYY')]
    //         },
    //         {
    //           key: 'extentityid',
    //           type: 'EQ',
    //           value: [entityId.toString()]
    //         },
    //         {
    //           key: 'accountid',
    //           type: 'EQ',
    //           value: [accountId.toString()]
    //         },
    //         {
    //           key: 'comparisontype',
    //           type: 'IN',
    //           value: ['matches', 'diff', 'unmatch']
    //         }
    //       ]
    //     }
    //   })
    //   .then(positions =>
    //     positions.map(position => ({
    //       assetType: position.assettype,
    //       comment: position.comment,
    //       externalDescription: position.extdescription,
    //       externalPosition: isNaN(parseFloat(position.extpos))
    //         ? null
    //         : parseFloat(position.extpos),
    //       id: isNaN(parseInt(position.id, 10))
    //         ? null
    //         : parseInt(position.id, 10),
    //       identifier1: position.id1,
    //       identifier2: position.id2,
    //       identifier3: position.id3,
    //       matchType: position.matchtype,
    //       pinnaklDescription: position.pnkldescription,
    //       pinnaklPosition: isNaN(parseFloat(position.pnklpos))
    //         ? null
    //         : parseFloat(position.pnklpos),
    //       pinnaklSecurityId: isNaN(parseInt(position.pnklsecid, 10))
    //         ? null
    //         : parseInt(position.pnklsecid, 10),
    //       resultType: position.resulttype,
    //       username: position.username
    //     }))
    //   );
  }

  saveComment(id: number, comment: string): Promise<ReconciliationPosition> {
    return this.wsp.putHttp({
      endpoint: this.EXTERNAL_POSITIONS_RESOURCE_URL,
      body: {
        comment,
        id: id.toString()
      }
    });
  }

  getPriceHistoryChart(securityId: number): Promise<any> {
    return this.wsp.getHttp({
      endpoint: this.PRICE_CHART_URL,
      params: {
        filters: [{ key: 'securityid', type: 'EQ', value: [securityId.toString()] }]
      }
    });
  }

  getPositionChart(securityId: number): Promise<any> {
    return this.wsp.getHttp<any>({
      endpoint: this.POSITION_CHART_URL,
      params: {
        filters: [{ key: 'securityid', type: 'EQ', value: [securityId.toString()] }]
      }
    });
  }

  getTradeHistory(
    id: number | string,
    underlyingSecId: number,
    isUnderlyingEnabled: boolean = false
  ): Promise<any> {
    return this.wsp.getHttp<any>({
      endpoint: this.TRADE_REQUEST_URL,
      params: {
        fields: [
          'tradedate',
          'trantype',
          'ticker',
          'cusip',
          'description',
          'quantity',
          'price',
          'currency',
          'commission',
          'netmoneylocal',
          'brokername',
          'commissionpershare'
        ],
        filters: [
          {
            key: isUnderlyingEnabled ? 'underlyingsecid' : 'securityid',
            type: 'EQ',
            value: [
              isUnderlyingEnabled ? underlyingSecId.toString() : id.toString()
            ]
          }
        ]
      }
    });
  }

  getTradeAllocationsBySecurity(
    secId: number,
    underlyingSecId: number,
    isUnderlyingEnabled: boolean,
    accountId?: string
  ): Promise<any> {
    const filters = [
      {
        key: isUnderlyingEnabled ? 'underlyingsecid' : 'securityid',
        type: 'EQ',
        value: [isUnderlyingEnabled ? underlyingSecId.toString() : secId]
      }
    ];
    if (accountId) {
      filters.push({ key: 'accountId', type: 'EQ', value: [accountId] });
    }
    return this.wsp.getHttp({
      endpoint: this.TRADE_ALLOCATION,
      params: {
        fields: [
          'tradedate',
          'trantype',
          'ticker',
          'cusip',
          'description',
          'quantity',
          'price',
          'currency',
          'commission',
          'netmoneylocal',
          'executingbrokername',
          'commpershare'
        ],
        filters
      }
    });
  }

  getPositionSummary(securityId: number, posDate: string): Promise<any> {
    return this.wsp.getHttp({
      endpoint: this.POSITION_SUMMARY,
      params: {
        filters: [
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityId.toString()]
          },
          {
            key: 'posdate',
            type: 'EQ',
            value: [posDate]
          }
        ]
      }
    });
  }

  getPnl(securityId: string, date: string): Promise<any> {
    return this.wsp.getHttp({
      endpoint: this.PNL_URL,
      params: {
        fields: ['AccountId', 'SecurityId', 'Mtd_Pnl', 'Ytd_Pnl'],
        filters: [
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityId.toString()]
          },
          {
            key: 'PnlDate',
            type: 'EQ',
            value: [date]
          }
        ]
      }
    });
  }

  getLatestTradeDate(securityId: string): Promise<any> {
    return this.wsp.getHttp({
      endpoint: this.TRADE_REQUEST_URL,
      params: {
        fields: ['tradedate'],
        filters: [
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityId.toString()]
          },
          {
            key: '',
            type: 'TOP',
            value: ['1']
          }
        ],
        orderBy: [
          {
            field: 'tradedate',
            direction: 'DESC'
          }
        ]
      }
    });
  }

  async getPriceAlerts(): Promise<SecurityPriceAlert[]> {
    const fields = [
      'assetType',
      'securityId',
      'ticker',
      'priceType',
      'condition',
      'price',
      'createDateTime',
      'status'
    ];
    const alerts = await this.wsp.getHttp<Partial<SecurityPriceAlert>[]>({
      endpoint: this.SECURITY_PRICE_ALERTS_URL,
      params: { fields }
    });
    return alerts.map(alert => new SecurityPriceAlert(alert));
  }

  async creatNewAlert(
    payload: SecurityPriceAlertPayload
  ): Promise<SecurityPriceAlert> {
    return this.wsp.postHttp({
      endpoint: this.SECURITY_PRICE_ALERTS_URL,
      body: payload
    });
  }

  async deleteAlert(id: string): Promise<any> {
    return this.wsp.deleteHttp({
      endpoint: `${this.SECURITY_PRICE_ALERTS_URL}/${id}`
    });
  }

  async getWatchlistItems(): Promise<WatchlistItem[]> {
    // id, securityid, ticker, CreateDateTime
    const fields = ['id', 'securityId', 'ticker', 'createDateTime'];
    const items = await this.wsp.getHttp<Partial<WatchlistItem>[]>({
      endpoint: this.WATCH_LIST_ITEMS_URL,
      params: { fields }
    });
    return items.map(item => new WatchlistItem(item));
  }

  async addToWatchlist(payload: any): Promise<any> {
    return this.wsp.postHttp({
      endpoint: this.WATCH_LIST_ITEMS_URL,
      body: payload
    });
  }

  async deleteFromWatchlist(id: string): Promise<any> {
    return this.wsp.deleteHttp({
      endpoint: `${this.WATCH_LIST_ITEMS_URL}/${id}`
    });
  }

  private formatRecon(position: any): ReconciliationPosition {
    return {
      assetType: position.assettype,
      comment: position.comment,
      externalDescription: position.extdescription,
      externalPosition: isNaN(parseFloat(position.extpos))
        ? null
        : parseFloat(position.extpos),
      id: isNaN(parseInt(position.id, 10)) ? null : parseInt(position.id, 10),
      identifier1: position.id1,
      identifier2: position.id2,
      identifier3: position.id3,
      matchType: position.matchtype,
      pinnaklDescription: position.pnkldescription,
      pinnaklPosition: isNaN(parseFloat(position.pnklpos))
        ? null
        : parseFloat(position.pnklpos),
      pinnaklSecurityId: isNaN(parseInt(position.pnklsecid, 10))
        ? null
        : parseInt(position.pnklsecid, 10),
      resultType: position.resulttype,
      username: position.username
    };
  }
}
