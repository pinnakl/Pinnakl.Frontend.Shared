import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map, tap } from 'rxjs/operators';

import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import { Utility } from '@pnkl-frontend/shared';
import { PositionsReportSaveHelper } from './positions-report-save-helper.service';
import {
  AttemptSavePositionsReport,
  SavePositionsReport,
  SavePositionsReportFailed
} from './positions-report-save-manager.actions';

@Injectable()
export class PositionsReportSaveManagerEffects {
  attemptSave$ = createEffect(() => this._actions$.pipe(
    ofType(AttemptSavePositionsReport),
    tap(() => this._pinnaklSpinner.spin()),
    map(payload => payload),
    concatMap(async payload => {
      try {
        const result = await this._positionsReportSaveHelper.save(payload);
        this._pinnaklSpinner.stop();
        this._toastr.success('Positions report saved successfully');
        return SavePositionsReport(result);
      } catch (error) {
        this._utility.showError(error);
        return SavePositionsReportFailed({ error });
      }
    })
  ));

  // We don't need to fetch columns after updating them.
  // Is not working if fetching columns from two different sources
  // Uncomment after moving to one general columns saving endpoint
  // save$: Observable<
  //   | LoadUserReportColumns
  //   | LoadUserReportCustomAttributes
  //   | LoadUserReportIdcColumns
  // > = createEffect(() => this._actions$.pipe(
  //   ofType<SavePositionsReport>(
  //     PositionsReportSaveManagerActionTypes.SavePositionsReport
  //   ),
  //   map(({ payload }) => payload),
  //   mergeMap(
  //     ({
  //       userReportColumns,
  //       userReportCustomAttributes,
  //       userReportIdcColumns
  //     }) => [
  //       new LoadUserReportColumns({ userReportColumns }),
  //       new LoadUserReportCustomAttributes({ userReportCustomAttributes }),
  //       new LoadUserReportIdcColumns({ userReportIdcColumns })
  //     ]
  //   )
  // ));

  constructor(
    private readonly _actions$: Actions,
    private readonly _pinnaklSpinner: PinnaklSpinner,
    private readonly _positionsReportSaveHelper: PositionsReportSaveHelper,
    private readonly _toastr: Toastr,
    private readonly _utility: Utility
  ) { }
}
