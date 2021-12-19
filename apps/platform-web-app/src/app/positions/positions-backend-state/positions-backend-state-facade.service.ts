import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, interval, Observable } from 'rxjs';

import {
  ReportingColumn,
  ReportParameter,
  SecurityPriceAlert,
  WatchlistItem
} from '@pnkl-frontend/shared';
import { filter, map } from 'rxjs/operators';

import {
  selectAllIdcColumns,
  selectAllPositionsClientReportColumns,
  selectAllPositionsReportColumns,
  selectAllPositionsReportDataInfo,
  selectAllPositionsUserIdcColumns,
  selectAllPositionsUserReportColumns,
  selectAllPositionsUserReportCustomAttribueColumns,
  selectAllSecurityCustomAttributes,
  selectAllSecurityPricesAlerts,
  selectAllWatchlistItems,
  selectIdcColumnsLoaded,
  selectPositionsReportLoaded,
  selectSecurityCustomAttributesLoaded,
  State
} from './store';
import { SetIsAllDataLoaded } from './store/all-data/all-data.actions';
import { AttemptLoadCustomAttributes } from './store/custom-attribute/custom-attribute.actions';
import { AttemptLoadIdcColumns } from './store/idc-column/idc-column.actions';
import { AttemptLoadPositionReportInfo } from './store/position-report-info/position-report-info.actions';
import { UpdatePositionsCalculatedAllData } from './store/positions-calculated-all-data';
import { AttemptLoadPositionsReportData } from './store/positions-report-data/positions-report-data.actions';
import { AttemptLoadSecurityPriceAlerts } from './store/security-prices-alerts/security-prices-alerts.actions';
import { AttemptLoadWatchlistItems } from './store/watchlist-items/watchlist-items.actions';

// Whenever i want to communicate with backend state, we use the properties and methods of Facade
@Injectable()
export class PositionsBackendStateFacade {
  constructor(private readonly _store: Store<State>) { }

  // We should be using pipe in selectIdcColumnsLoaded and selectPositionsReportLoaded as well
  IdcColumnsLoaded$: Observable<boolean> = this._store.select(
    selectIdcColumnsLoaded
  );

  positionsReportInfoLoaded$: Observable<boolean> = this._store.select(
    selectPositionsReportLoaded
  );

  allColumns$: Observable<any[]> = combineLatest([
    this._store.select(selectAllPositionsReportColumns),
    this._store.select(selectAllSecurityCustomAttributes),
    this._store.select(selectAllIdcColumns)
  ]);

  positionsReportClientReportColumns$ = this._store.pipe(
    select(selectAllPositionsClientReportColumns)
  );

  positionsReportUserReportColumns$ = this._store.pipe(
    select(selectAllPositionsUserReportColumns)
  );

  positionsReportUserReportCustomAttributes$ = this._store.pipe(
    select(selectAllPositionsUserReportCustomAttribueColumns)
  );

  positionsReportUserReportIdcColumns$ = this._store.pipe(
    select(selectAllPositionsUserIdcColumns)
  );

  securityCustomAttributesLoaded$: Observable<boolean> = this._store.select(
    selectSecurityCustomAttributesLoaded
  );

  positionsSecurityAlerts$: Observable<SecurityPriceAlert[]> = this._store.pipe(
    select(selectAllSecurityPricesAlerts)
  );

  positionsWatchlistItems$: Observable<WatchlistItem[]> = this._store.pipe(
    select(selectAllWatchlistItems)
  );

  loadIdcColumns(): void {
    this._store.dispatch(AttemptLoadIdcColumns());
  }

  loadPositionsReportInfo(): void {
    this._store.dispatch(AttemptLoadPositionReportInfo());
  }

  loadSecurityCustomAttributes(): void {
    this._store.dispatch(AttemptLoadCustomAttributes());
  }

  loadSecurityPriceAlerts(): void {
    this._store.dispatch(AttemptLoadSecurityPriceAlerts());
  }

  loadWatchListItems(): void {
    this._store.dispatch(AttemptLoadWatchlistItems());
  }

  loadPositionsReportData(newFilter: {
    id: number;
    params: ReportParameter[];
    reportingColumns: ReportingColumn[];
  }): void {
    this._store.dispatch(AttemptLoadPositionsReportData({ payload: newFilter }));
  }

  markIsLoadedAsFalse(): void {
    this._store.dispatch(SetIsAllDataLoaded({ payload: false }));
  }

  startWebWorkerCalc(): void {
    const data$ = new BehaviorSubject(null);
    this._store.pipe(select(selectAllPositionsReportDataInfo)).subscribe(data$);

    const allDataCalculator = new Worker(new URL('./positions-all-data.worker', import.meta.url), { type: 'module', name: 'all-data-calculator' });

    allDataCalculator.onmessage = (message) =>
      this._store.dispatch(UpdatePositionsCalculatedAllData({ data: message.data }));

    interval(1000).pipe(
      map(() => data$.value),
      filter(data => !!data)
    ).subscribe(allData => allDataCalculator.postMessage(allData));
  }
}
