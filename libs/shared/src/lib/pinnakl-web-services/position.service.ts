import { Injectable } from '@angular/core';

import * as moment from 'moment';

// tslint:disable-next-line:nx-enforce-module-boundaries
import {
  DeleteWebRequest,
  GetWebRequest,
  PostWebRequest,
  WebServiceProvider
} from '@pnkl-frontend/core';
import { ReconciliationPosition } from '../models/recon';
import { ReconciliationPositionFromApi } from '../models/recon/reconciliation-position-from-api.model';
import {
  SecurityPriceAlert,
  WatchlistItem,
  SecurityPriceAlertPayload
} from '../models/security-price-alert.model';

@Injectable()
export class PositionService {
  private readonly RECONCILIATION_RESOURCE_URL = 'recon';
  private readonly EXTERNAL_POSITIONS_RESOURCE_URL = 'extpos';
  private readonly PRICE_CHART_URL = 'security_price_timeseries';
  private readonly POSITION_CHART_URL = 'security_position_timeseries';
  private readonly TRADE_REQUEST_URL = 'trade_requests';
  private readonly POSITION_SUMMARY = 'positions_mv';
  private readonly PNL_URL = 'pnl_per_security';
  private readonly SECURITY_PRICE_ALERTS_URL = 'security_price_alerts';
  private readonly WATCH_LIST_ITEMS_URL = 'watch_list_items';

  constructor(private wsp: WebServiceProvider) {}

  getPositions(
    accountId: number,
    entityId: number,
    reconciliationDate: Date
  ): Promise<ReconciliationPosition[]> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.RECONCILIATION_RESOURCE_URL,
      options: {
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
    };
    return this.wsp
      .get(getWebRequest)
      .then((positions: ReconciliationPositionFromApi[]) =>
        positions.map(position => ({
          assetType: position.assettype,
          comment: position.comment,
          externalDescription: position.extdescription,
          externalPosition: isNaN(parseFloat(position.extpos))
            ? null
            : parseFloat(position.extpos),
          externalTrsIndicator:
            position.exttrsindicator === ''
              ? null
              : position.exttrsindicator === 'True',
          id: isNaN(parseInt(position.id, 10))
            ? null
            : parseInt(position.id, 10),
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
          pinnaklTrsIndicator:
            position.pnkltrsindicator === ''
              ? null
              : position.pnkltrsindicator === 'True',
          resultType: position.resulttype,
          username: position.username
        }))
      );
  }

  saveComment(id: number, comment: string): Promise<ReconciliationPosition> {
    const saveCommentRequestBody = {
      id,
      comment
    };
    return this.wsp.put({
      endPoint: this.EXTERNAL_POSITIONS_RESOURCE_URL,
      payload: saveCommentRequestBody
    });
  }

  getPriceHistoryChart(securityId: string): Promise<any> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.PRICE_CHART_URL,
      options: {
        filters: [{ key: 'securityid', type: 'EQ', value: [securityId] }]
      }
    };
    return this.wsp.get(getWebRequest);
  }

  getPositionChart(securityId: string): Promise<any> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.POSITION_CHART_URL,
      options: {
        filters: [{ key: 'securityid', type: 'EQ', value: [securityId] }]
      }
    };
    return this.wsp.get(getWebRequest);
  }

  getTradeHistory(securityId: number | string): Promise<any> {
    const fields = [
      'tradedate',
      'trantype',
      'trsindicator',
      'ticker',
      'cusip',
      'description',
      'quantity',
      'price',
      'currency',
      'commission',
      'netmoneylocal',
      'brokername'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.TRADE_REQUEST_URL,
      options: {
        fields: fields,
        filters: [
          {
            key: 'securityid',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    };

    return this.wsp.get(getWebRequest);
  }

  getPositionSummary(securityId: string, posDate: string): Promise<any> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.POSITION_SUMMARY,
      options: {
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
    };
    return this.wsp.get(getWebRequest);
  }

  getPnl(securityId: string, date: string): Promise<any> {
    const fields = ['AccountId', 'SecurityId', 'Mtd_Pnl', 'Ytd_Pnl'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.PNL_URL,
      options: {
        fields: fields,
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
    };
    return this.wsp.get(getWebRequest);
  }

  getLatestTradeDate(securityId: string): Promise<any> {
    const fields = ['tradedate'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.TRADE_REQUEST_URL,
      options: {
        fields: fields,
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
    };
    return this.wsp.get(getWebRequest);
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
    const getWebRequest: GetWebRequest = {
      endPoint: this.SECURITY_PRICE_ALERTS_URL,
      options: { fields }
    };
    const alerts = await this.wsp.get(getWebRequest);
    return alerts.map(alert => new SecurityPriceAlert(alert));
  }

  async creatNewAlert(
    payload: SecurityPriceAlertPayload
  ): Promise<SecurityPriceAlert> {
    const postWebRequest: PostWebRequest = {
      endPoint: this.SECURITY_PRICE_ALERTS_URL,
      payload
    };
    return this.wsp.post(postWebRequest);
  }

  async deleteAlert(id: string): Promise<any> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: this.SECURITY_PRICE_ALERTS_URL,
      payload: { id }
    };
    return this.wsp.delete(deleteWebRequest);
  }

  async getWatchlistItems(): Promise<WatchlistItem[]> {
    //id, securityid, ticker, CreateDateTime
    const fields = [
      'id',
      'securityId',
      'ticker',
      'createDateTime'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.WATCH_LIST_ITEMS_URL,
      options: { fields }
    };
    const items = await this.wsp.get(getWebRequest);
    return items.map(item => new WatchlistItem(item));
  }

  async addToWatchlist(payload: any): Promise<any> {
    const postWebRequest: PostWebRequest = {
      endPoint: this.WATCH_LIST_ITEMS_URL,
      payload
    };
    return this.wsp.post(postWebRequest);
  }

  async deleteFromWatchlist(id: string): Promise<any> {
    const deleteWebRequest: DeleteWebRequest = {
      endPoint: this.WATCH_LIST_ITEMS_URL,
      payload: { id }
    };
    return this.wsp.delete(deleteWebRequest);
  }
}
