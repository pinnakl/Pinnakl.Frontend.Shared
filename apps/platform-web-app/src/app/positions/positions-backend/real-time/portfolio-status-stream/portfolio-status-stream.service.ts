import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ServerSentEventsStreamService } from '@pnkl-frontend/core';
import { environment } from '../../../../../environments';
import { AddCashData } from '../../../positions-backend-state/store/cash-data/cash-data.actions';
import { PortfolioStatusStreamFromApiModel } from './portfolio-status-stream.from-api.model';
import { PortfolioStatusStreamModel } from './portfolio-status-stream.model';

interface PortfolioStatusStreamMessage {
  Message: {
    AccountPortfolioStatusList: {
      AccountId: number;
      Cash: {
        CashNow: number;
        CashPrevClose: number;
      };
      PositionsWithPL: PortfolioStatusStreamFromApiModel[];
    }[],
  };
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioStatusStreamService {
  constructor(
    private readonly _sse: ServerSentEventsStreamService,
    private readonly _store: Store
  ) { }

  subscribe(): Observable<PortfolioStatusStreamModel[]> {
    return this._sse
      .subscribeToServerSentEvents<PortfolioStatusStreamMessage>(environment.sseBackupAppUrl, [], 'RTPortfolioStatus')
      .pipe(
        map(portfolioStatus => {
          if (
            portfolioStatus.Message.AccountPortfolioStatusList &&
            Array.isArray(portfolioStatus.Message.AccountPortfolioStatusList)
          ) {
            portfolioStatus.Message.AccountPortfolioStatusList.forEach(item => {
              if (item.Cash) {
                this._store.dispatch(AddCashData({
                  payload: {
                    accountId: item.AccountId,
                    cashToday: item.Cash.CashNow || 0,
                    cashYesterday: item.Cash.CashPrevClose || 0
                  }
                }));
              }
            });
          }
          const items = portfolioStatus.Message.AccountPortfolioStatusList
            .map(item => item.PositionsWithPL.map(pos => ({
              ...pos,
              AccountId: item.AccountId
            })))
            .reduce((acc, el) => [...acc, ...el], []);

          // Avoid more than 1 record per security in PMS table if there are different cost values
          return items.length > 0 ? this.addCalculatedCost(items) : [];
        }),
        map(formatRealTimePositions)
      );
  }

  unsubscribe(): void {
    this._sse.unsubscribeToServerSentEvents(environment.sseBackupAppUrl, [], 'RTPortfolioStatus');
  }

  public addCalculatedCost(items: { SecurityId: number, Quantity: number, Cost: number }[]): any[] {
    const costsMap = new Map();
    items.forEach(i => {
      if (!costsMap.has(i.SecurityId)) {
        costsMap.set(i.SecurityId, [{ quantity: i.Quantity, cost: i.Cost }]);
      } else {
        const costItem = costsMap.get(i.SecurityId);
        costsMap.set(i.SecurityId, [...costItem, { quantity: i.Quantity, cost: i.Cost }]);
      }
    });

    const calcCost = (costsArray: { quantity: number, cost: number }[]): number => {
      let total = 0;
      let cost = 0;
      for (const a of costsArray) {
        cost += a.quantity * a.cost;
        total += a.quantity;
      }
      return total === 0 ?
        costsArray.reduce((acc, c) => acc + c.cost, 0) / costsArray.length :
        cost / total;
    };
    return items.map(i => ({
      ...i,
      Cost: calcCost(costsMap.get(i.SecurityId))
    }));
  }
}

function formatRealTimePosition({
  AccountId,
  Cost,
  Quantity,
  CustomAttribId,
  RealizedPnl,
  SecurityId
}: PortfolioStatusStreamFromApiModel): PortfolioStatusStreamModel {
  return {
    accountId: AccountId,
    customAttributeId: CustomAttribId,
    pnlRealized: RealizedPnl,
    position: Quantity,
    cost: Cost,
    securityId: SecurityId,
    updatedAt: new Date()
  };
}

function formatRealTimePositions(
  positions: PortfolioStatusStreamFromApiModel[]
): PortfolioStatusStreamModel[] {
  return positions.map(formatRealTimePosition);
}
