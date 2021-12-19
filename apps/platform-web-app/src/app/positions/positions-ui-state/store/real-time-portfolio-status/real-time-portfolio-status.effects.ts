import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';

import {
  bufferTime,
  concatMap,
  filter,
  map,
  switchMap,
  take,
  takeWhile,
  tap
} from 'rxjs/operators';

import { selectAllPositionsReportData } from '../../../positions-backend-state';
import { selectPositionsReportEntities } from '../../../positions-backend-state/guards/positions-report-data-loaded.guard';

import { getReportingColumnsFromCustomAttributes, getReportingColumnsFromReportColumn } from '@pnkl-frontend/shared';
import {
  AttemptLoadPositionsReportData,
  UpdateManyPositionsReportData
} from '../../../positions-backend-state/store/positions-report-data/positions-report-data.actions';
import { PortfolioStatusStreamModel } from '../../../positions-backend/real-time/portfolio-status-stream/portfolio-status-stream.model';
import { PortfolioStatusStreamService } from '../../../positions-backend/real-time/portfolio-status-stream/portfolio-status-stream.service';
import { RealTimePortfolioStatusActionTypes } from './real-time-portfolio-status.actions';

@Injectable()
export class RealTimePortfolioStatusEffects {
  private subscriptionActive = false;

  subscribeRealTimePortfolioStatus$ = createEffect(() => this._actions$.pipe(
    ofType(
      RealTimePortfolioStatusActionTypes.SubscribeToRealTimePortfolioStatus
    ),
    tap(() => (this.subscriptionActive = true)),
    concatMap(() => this._realTimePortfolioStatusStream.subscribe().pipe(
        bufferTime(250),
        map(portfolioStatus2d =>
          portfolioStatus2d.reduce(
            (reduced, portfolioStatus) => [...reduced, ...portfolioStatus],
            []
          )
        ),
        filter(realtimePortfolioStatus => !!realtimePortfolioStatus.length),
        map(realtimePortfolioStatus => {
          let reportData = null;
          this._store$.pipe(
            select(selectAllPositionsReportData), take(1)
          ).subscribe(reportDataValue => reportData = reportDataValue);

          let reportEntities = null;
          this._store$.pipe(
            select(selectPositionsReportEntities),
            filter(entities =>
              Object.values(entities).some(e => !!e.length)
            ),
            take(1)
          ).subscribe(reportEntitiesValue => reportEntities = reportEntitiesValue);

          let isAccountExisted = true;
          let isSecurityExisted = true;
          if (reportData) {
            const realtimePortfolioStatusAccountIds = Array.from(
              new Set(realtimePortfolioStatus.map(p => p.accountId))
            );
            const reportDataAccountIds = Array.from(
              new Set(reportData.map(p => p.AccountId))
            );
            isAccountExisted = realtimePortfolioStatusAccountIds.every((d: number) =>
              reportDataAccountIds.includes(d)
            );

            const realtimePortfolioStatusSecurityIds = Array.from(
              new Set(realtimePortfolioStatus.map(p => p.securityId))
            );
            const reportDataSecurityIds = Array.from(
              new Set(reportData.map(p => p.SecurityId))
            );
            isSecurityExisted = realtimePortfolioStatusSecurityIds.every((s: number) => {
              const isSecurityInExistedReportData = reportDataSecurityIds.includes(s);
              if (!isSecurityInExistedReportData) {
                console.log('There is security in stream which aren\'t provided in report data. Security', s);
              }
              return isSecurityInExistedReportData;
            }
            );
          }

          const updatedPortfolioStatus = realtimePortfolioStatus.map(
            this.getReportDataFromRealTimePortfolioStatus
          );

          const actionsToDispatch = [];
          if (!isAccountExisted || !isSecurityExisted) {
            const { columns = [], parameters, customAttributes } = reportEntities;
            actionsToDispatch.push(
              AttemptLoadPositionsReportData({
                payload: {
                  id: columns[0]?.reportId,
                  params: parameters,
                  reportingColumns: getReportingColumnsFromReportColumn(
                    columns
                  ).concat(
                    getReportingColumnsFromCustomAttributes(customAttributes)
                  )
                }
              })
            );
          }

          actionsToDispatch.push(UpdateManyPositionsReportData({ reportDataToUpdate: updatedPortfolioStatus }));

          return actionsToDispatch;
        }),
        switchMap(res => [...res]),
        takeWhile(() => this.subscriptionActive)
      ))
  ));

  unSubscribeToRealTimePortfolioStatus$ = createEffect(() => this._actions$.pipe(
    ofType(
      RealTimePortfolioStatusActionTypes.UnSubscribeToRealTimePortfolioStatus
    ),
    tap(() => {
      this._realTimePortfolioStatusStream.unsubscribe();
      this.subscriptionActive = false;
    })
  ), { dispatch: false });

  private getReportDataFromRealTimePortfolioStatus(
    realTimePortfolioStatus: PortfolioStatusStreamModel
  ): any {
    return {
      AccountId: realTimePortfolioStatus.accountId,
      CustomAttributeId: realTimePortfolioStatus.customAttributeId,
      SecurityId: realTimePortfolioStatus.securityId,
      pnlRealized: realTimePortfolioStatus.pnlRealized,
      Position: realTimePortfolioStatus.position,
      Cost: realTimePortfolioStatus.cost,
      UpdatedAt: realTimePortfolioStatus.updatedAt
    };
  }
  constructor(
    private readonly _store$: Store<any>,
    private readonly _actions$: Actions,
    private readonly _realTimePortfolioStatusStream: PortfolioStatusStreamService
  ) { }
}
