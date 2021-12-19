import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { createSelector, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, mergeMap, take, tap } from 'rxjs/operators';

import {
  getReportingColumnsFromCustomAttributes,
  getReportingColumnsFromReportColumn
} from '@pnkl-frontend/shared';
import {
  selectAllPositionsReportColumns,
  selectAllPositionsReportParameters,
  selectAllSecurityCustomAttributes,
  selectPositionsDataLoaded,
  State
} from '../store';
import { AttemptLoadPositionsReportData } from '../store/positions-report-data/positions-report-data.actions';

@Injectable()
export class PositionsReportDataLoadedGuard implements CanActivate {
  public constructor(private readonly _store: Store<State>) { }

  canActivate(): Observable<boolean> {
    return this._store.pipe(
      select(selectPositionsReportEntities),
      filter(entities => Object.values(entities).every(e => !!e.length)),
      take(1),
      tap(({ columns, parameters, customAttributes }) =>
        this._store.dispatch(
          AttemptLoadPositionsReportData({
            payload: {
              id: columns[0].reportId,
              params: parameters,
              reportingColumns: getReportingColumnsFromReportColumn(
                columns
              ).concat(getReportingColumnsFromCustomAttributes(customAttributes))
            }
          })
        )
      ),
      mergeMap(() => this._store.pipe(select(selectPositionsDataLoaded))),
      filter(loaded => loaded),
      take(1)
    );
  }
}

export const selectPositionsReportEntities = createSelector(
  selectAllPositionsReportColumns,
  selectAllPositionsReportParameters,
  selectAllSecurityCustomAttributes,
  (columns, parameters, customAttributes) => ({
    columns,
    parameters,
    customAttributes
  })
);
