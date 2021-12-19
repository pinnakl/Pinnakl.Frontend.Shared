import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import {
  LoadReportParameters
} from '../../../positions-backend-state/store/report-parameter/report-parameter.actions';
import { LoadPositionsReportParameterValues } from './positions-report-parameter-value.actions';

@Injectable()
export class PositionsReportParameterValueEffects {
  load$ = createEffect(() => this._actions$.pipe(
    ofType(LoadReportParameters),
    map(action => action.reportParameters),
    map(reportParameters =>
      LoadPositionsReportParameterValues({
        positionsReportParameterValues: reportParameters.map(
          ({ id, value }) => ({ id, value })
        )
      })
    )
  ));
  constructor(private readonly _actions$: Actions) { }
}
