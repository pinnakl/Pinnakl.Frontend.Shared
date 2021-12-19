import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map } from 'rxjs/operators';

import { PositionsReportDataService } from '../../../positions-backend/positions-report-data/positions-report-data.service';
import {
  AttemptLoadPositionsReportData,
  LoadPositionsReportData,
  LoadPositionsReportDataFailed
} from './positions-report-data.actions';

@Injectable()
export class PositionsReportDataEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadPositionsReportData),
    map(action => action.payload),
    concatMap(filter => this.positionsReportDataService
      .get(<Date>filter.params[0].value)
      .then((reportData: any[]) => {
        const now = new Date();
        reportData = reportData.map(x => ({
          ...x,
          Mark: 0,
          pnlRealized: 0,
          pnlUnRealized: 0,
          UpdatedAt: now
        }));
        // localStorage.positionsReportData = JSON.stringify(reportData);
        return LoadPositionsReportData({ positionsReportData: reportData });
      })
      .catch(error => LoadPositionsReportDataFailed({ error })))
  ));

  constructor(
    private readonly actions$: Actions,
    private readonly positionsReportDataService: PositionsReportDataService
  ) { }
}
