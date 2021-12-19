import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  createFeatureSelector,
  createSelector,
  select,
  Store
} from '@ngrx/store';

import { sortBy } from 'lodash';
import { concatMap, map, take } from 'rxjs/operators';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import {
  getReportingColumnsFromCustomAttributes,
  getReportingColumnsFromReportColumn,
  ReportColumn,
  ReportingColumn,
  ReportParameter,
  Utility
} from '@pnkl-frontend/shared';
import {
  selectAllPositionsReportColumns,
  selectAllPositionsReportParameters,
  selectAllSecurityCustomAttributes
} from '../../../positions-backend-state';
import {
  AttemptLoadPositionsReportData,
  LoadPositionsReportData,
  LoadPositionsReportDataFailed,
  PositionsReportDataActionTypes
} from '../../../positions-backend-state/store/positions-report-data/positions-report-data.actions';
import { selectAll } from '../positions-report-parameter-value/positions-report-parameter-value.reducer';
import {
  ApplyPositionsFilter,
  PositionsFilterActionTypes
} from './positions-filter.actions';

@Injectable()
export class PositionsFilterEffects {
  applyPositionsFilter$ = createEffect(() => this.actions$.pipe(
    ofType(ApplyPositionsFilter),
    map(({ idcColumnsAdded }) => idcColumnsAdded),
    map((idcColumnsAdded) => {
      let params: ReportParameter[],
        reportColumns: ReportColumn[],
        customAttributeColumns: ReportingColumn[];
      this._store
        .pipe(select(selectAllPositionsReportColumns), take(1))
        .subscribe(columns => (reportColumns = columns));
      this._store
        .pipe(select(selectAllPositionsFilterParameterValues), take(1))
        .subscribe(parameters => (params = parameters));
      this._store
        .pipe(select(selectAllSecurityCustomAttributes), take(1))
        .subscribe(
          customAttrs =>
          (customAttributeColumns = getReportingColumnsFromCustomAttributes(
            customAttrs
          ))
        );

      return AttemptLoadPositionsReportData({
        payload: {
          id: reportColumns[0].reportId,
          params,
          reportingColumns: [
            ...getReportingColumnsFromReportColumn(reportColumns),
            ...customAttributeColumns,
            ...idcColumnsAdded
          ]
        }
      });
    })
  ));

  applyPositionsFilterSpinner$ = createEffect(() => this.actions$.pipe(
    ofType(PositionsFilterActionTypes.ApplyPositionsFilter),
    concatMap(() => {
      this.spinnerSvc.spin();
      return this.actions$.pipe(
        ofType(LoadPositionsReportData, LoadPositionsReportDataFailed),
        take(1),
        map((action) => {
          if (action.type === PositionsReportDataActionTypes.LoadPositionsReportData) {
            this.spinnerSvc.stop();
          } else {
            this.utilitySvc.showError(action.error);
          }
        }
        )
      );
    })
  ), { dispatch: false });

  constructor(
    private readonly actions$: Actions,
    private readonly _store: Store<any>,
    private readonly spinnerSvc: PinnaklSpinner,
    private readonly utilitySvc: Utility
  ) { }
}

const featureSelector = createFeatureSelector<any>('positionsUi');

// PositionsReportParameterValue Selectors
const selectFeaturePositionsReportParameterValue = createSelector(
  featureSelector,
  (state: any) => state.positionsReportParameterValue
);
const selectAllPositionsReportParameterValues = createSelector(
  selectFeaturePositionsReportParameterValue,
  selectAll
);

const selectAllPositionsFilterParameterValues = createSelector(
  selectAllPositionsReportParameters,
  selectAllPositionsReportParameterValues,
  (parameters, parameterValues) =>
    !parameterValues.length
      ? parameters
      : _sortByName(
        parameters.map(p => {
          const { value } = parameterValues.find(pv => pv.id === p.id);
          return { ...p, value };
        })
      )
);

function _sortByName<T>(collection: T[]): T[] {
  return sortBy(collection, ['name']);
}
