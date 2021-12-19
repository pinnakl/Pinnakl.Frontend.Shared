import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  createFeatureSelector,
  createSelector,
  select,
  Store
} from '@ngrx/store';
import {
  bufferTime,
  concatMap,
  filter,
  map,
  take,
  takeWhile,
  tap
} from 'rxjs/operators';
import { PortfolioStatusStreamModel } from '../../../../../positions/positions-backend/real-time/portfolio-status-stream/portfolio-status-stream.model';
import { PortfolioStatusStreamService } from '../../../../../positions/positions-backend/real-time/portfolio-status-stream/portfolio-status-stream.service';
import { PriceStreamService } from '../../../../../positions/positions-backend/real-time/price-stream/price-stream.service';
import {
  UpdateManyPnlCalculatedAttributes,
  UpdateManyPricesPnlCalculatedAttributes
} from '../../../pnl-backend-state/store/pnl-calculated-attribute/pnl-calculated-attribute.actions';
import { PnlCalculatedAttribute } from '../../../pnl-backend/pnl-calculated-attribute/pnl-calculated-attribute.model';
import { PnlFilter } from '../../../pnl-backend/pnl-calculated/pnl-calculated-filter.model';
import { selectFilterValue } from '../pnl-filters/pnl-filters.reducer';
import { SubscribeToRealTimePnl, SubscribeToRealTimePricePnl, UnSubscribeToRealTimePnl, UnSubscribeToRealTimePricePnl } from './real-time-pnl.actions';

const featureSelector = createFeatureSelector<any>('pnlUi');

const selectFeaturePnlFilter = createSelector(
  featureSelector,
  (state: any) => state.pnlFilters
);
const selectPnlFilterValues = createSelector(
  selectFeaturePnlFilter,
  selectFilterValue
);

@Injectable()
export class RealTimePnlEffects {
  private subscriptionActive = false;
  private subscriptionPriceActive = false;

  subscribeRealTimePnl$ = createEffect(() => this._actions$.pipe(
    ofType(SubscribeToRealTimePnl),
    tap(() => (this.subscriptionActive = true)),
    concatMap(() => this._portfolioStatusStream.subscribe().pipe(
      bufferTime(250),
      map(positions2d =>
        positions2d.reduce(
          (reduced, positions) => [...reduced, ...positions],
          []
        )
      ),
      filter(realtimePositions => !!realtimePositions.length),
      map(realtimePositions => {
        let pnlFilterValues: PnlFilter;
        this._store
          .pipe(
            select(selectPnlFilterValues),
            take(1)
          )
          .subscribe(value => (pnlFilterValues = value));
        return UpdateManyPnlCalculatedAttributes({
          pnlCalculatedAttributes: realtimePositions
            .filter(
              data => data.accountId.toString() === pnlFilterValues.account.id
            )
            .map(this.getPnlCalculatedAttributeObjectFromRealTimePnl)
        });
      }),
      takeWhile(() => this.subscriptionActive)
    ))
  ));

  subscribeRealTimePricePnl$ = createEffect(() => this._actions$.pipe(
    ofType(SubscribeToRealTimePricePnl),
    tap(() => (this.subscriptionPriceActive = true)),
    concatMap(() => this._priceStream.subscribe().pipe(
      bufferTime(500),
      filter(realtimePositions => !!realtimePositions.length),
      map((realtimePrice: any) => UpdateManyPricesPnlCalculatedAttributes({
          pnlCalculatedAttributes: realtimePrice
        })),
      takeWhile(() => this.subscriptionPriceActive)
    ))
  ));

  unSubscribeToRealTimePnl$ = createEffect(() => this._actions$.pipe(
    ofType(UnSubscribeToRealTimePnl),
    tap(() => {
      this.subscriptionActive = false;
      this._portfolioStatusStream.unsubscribe();
    })
  ), { dispatch: false });

  unSubscribeToRealTimePricePnl$ = createEffect(() => this._actions$.pipe(
    ofType(UnSubscribeToRealTimePricePnl),
    tap(() => {
      this.subscriptionPriceActive = false;
      this._priceStream.unsubscribe();
    })
  ), { dispatch: false });

  private getPnlCalculatedAttributeObjectFromRealTimePnl(
    portfolioStatusStreamModel: PortfolioStatusStreamModel
  ): Partial<PnlCalculatedAttribute> {
    const {
      customAttributeId,
      pnlRealized,
      securityId,
      position,
      cost
    } = portfolioStatusStreamModel;
    return {
      attributeId: customAttributeId,
      realizedPnl: pnlRealized,
      securityId: securityId,
      price: cost,
      position
    } as Partial<PnlCalculatedAttribute>;
  }

  constructor(
    private readonly _actions$: Actions,
    private readonly _portfolioStatusStream: PortfolioStatusStreamService,
    private readonly _priceStream: PriceStreamService,
    private readonly _store: Store<any>
  ) { }
}
