import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { ServerSentEventsStreamService } from '@pnkl-frontend/core';

import { bufferTime, concatMap, filter, map, take, takeWhile, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments';

import { selectAllPositionsReportData } from '../../../positions-backend-state';
import { UpdateManyPriceReportData } from '../../../positions-backend-state/store/positions-report-data/positions-report-data.actions';
import { GreekStreamModel } from '../../../positions-backend/real-time/price-stream/greek-stream.model';
import { PriceStreamModel } from '../../../positions-backend/real-time/price-stream/price-stream.model';
import { PriceStreamService } from '../../../positions-backend/real-time/price-stream/price-stream.service';
import { RealTimePriceActionTypes, SubscribeToRealTimeGreeks, SubscribeToRealTimePrice } from './real-time-price.actions';

@Injectable()
export class RealTimePriceEffects {
  private subscriptionActive = false;

  subscribeRealTimePrice$ = createEffect(() => this._actions$.pipe(
    ofType(SubscribeToRealTimePrice),
    tap(() => (this.subscriptionActive = true)),
    concatMap(() => this._realTimePriceService.subscribe().pipe(
      bufferTime(250),
      filter(realtimePrice => !!realtimePrice.length),
      concatMap(realtimePrice => this._store$.pipe(
        select(selectAllPositionsReportData),
        take(1),
        map((reportData) => (UpdateManyPriceReportData({
          reportDataToUpdate: updateReportDataWithRealtimePrice(
            reportData,
            realtimePrice
          )
        })))
      )),
      takeWhile(() => this.subscriptionActive)
    ))
  ));

  subscribeRealTimeGreeks$ = createEffect(() => this._actions$.pipe(
    ofType(SubscribeToRealTimeGreeks),
    tap(() => (this.subscriptionActive = true)),
    concatMap(() => this._sse.subscribeToServerSentEvents<{ Message: any }>(environment.sseBackupAppUrl, [
      'REALTIME_GREEKS'
    ]).pipe(
      bufferTime(250),
      filter(realtimeGeeks => !!realtimeGeeks.length),
      map(realtimeGeeks => realtimeGeeks.map(g => g.Message)),
      concatMap(realtimeGeeks => this._store$.pipe(
        select(selectAllPositionsReportData),
        take(1),
        map(reportData => (UpdateManyPriceReportData({
          reportDataToUpdate: updateReportDataWithRealtimeGreeks(
            reportData,
            realtimeGeeks
          )
        })))
      )),
      takeWhile(() => this.subscriptionActive)
    ))
  ));

  unSubscribeToRealTimePrice$ = createEffect(() => this._actions$.pipe(
    ofType(RealTimePriceActionTypes.UnSubscribeToRealTimePrice),
    tap(() => {
      this.subscriptionActive = false;
      this._realTimePriceService.unsubscribe();
      this._sse.unsubscribeToServerSentEvents(environment.sseBackupAppUrl, [
        'REALTIME_GREEKS'
      ]);
    })
  ), {dispatch: false});

  constructor(
    private readonly _store$: Store,
    private readonly _actions$: Actions,
    private readonly _realTimePriceService: PriceStreamService,
    private readonly _sse: ServerSentEventsStreamService
  ) {
  }
}

function updateReportDataWithRealtimePrice(
  reportData: any[],
  realtimePrice: PriceStreamModel[]
): any[] {
  return reportData.map(existingEntity => {
    const updatedEntity = {...existingEntity};
    realtimePrice.forEach(dataToUpdate => {
      if (updatedEntity.SecurityId === dataToUpdate.securityId && dataToUpdate.priceType === 'mid') {
        updatedEntity.Mark = dataToUpdate.value;

        // We are doing this so DeltaAdjExposure can be calculated for equities.
        // Backend is not sending Delta and UndPrice for equities
        if (updatedEntity.AssetType.toLowerCase() !== 'option') {
          updatedEntity.Delta = 1;
          updatedEntity.UndPrc = dataToUpdate.value;
        }
      }
    });

    return updatedEntity;
  });
}

function updateReportDataWithRealtimeGreeks(
  reportData: any[],
  realtimePrice: GreekStreamModel[]
): any[] {
  return reportData.map(existingEntity => {
    const updatedEntity = { ...existingEntity };
    realtimePrice.forEach(dataToUpdate => {
      if (updatedEntity.SecurityId === dataToUpdate.SecurityId) {
        if (dataToUpdate.PriceType.toLowerCase() === 'impliedvol') {
          updatedEntity.ImpliedVol = dataToUpdate.Value * 100;
        } else {
          Object.keys(updatedEntity).forEach(field => {
            if (field.toLowerCase() === dataToUpdate.PriceType.toLowerCase()) {
              updatedEntity[field] = dataToUpdate.Value;
            }
          });
        }
      }
    });

    return updatedEntity;
  });
}
