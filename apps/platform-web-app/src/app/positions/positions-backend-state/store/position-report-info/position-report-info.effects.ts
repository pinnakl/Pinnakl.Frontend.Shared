import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map } from 'rxjs/operators';
import { PositionsReportInfo } from '../../../positions-backend/positions-report-info/positions-report-info.model';
import { PositionsReportInfoService } from '../../../positions-backend/positions-report-info/positions-report-info.service';
import { LoadClientReportColumns } from '../client-report-column/client-report-column.actions';
import { LoadReportColumns } from '../report-column/report-column.actions';
import { LoadReportParameters } from '../report-parameter/report-parameter.actions';
import { LoadUserReportColumns } from '../user-report-column/user-report-column.actions';
import { LoadUserReportCustomAttributes } from '../user-report-custom-attribute-column/user-report-custom-attribute.actions';
import { LoadUserReportIdcColumns } from '../user-report-idc-column/user-report-idc-column.actions';
import {
  AttemptLoadPositionReportInfo,
  LoadPositionReportInfo,
  LoadPositionReportInfoFailed
} from './position-report-info.actions';


@Injectable()
export class PositionReportInfoEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadPositionReportInfo),
    concatMap(() =>
      this.positionReportInfoService
        .get()
        .then(this.addFormulaFieldFromReportColumns)
        .then((positionsReportInfo: PositionsReportInfo) => LoadPositionReportInfo({ positionsReportInfo }))
        .catch(error => LoadPositionReportInfoFailed({ error }))
    )
  ));

  loadPositionsStore$ = createEffect(() => this.actions$.pipe(
    ofType(LoadPositionReportInfo),
    map(loadAction => loadAction.positionsReportInfo),
    concatMap((positionsReportInfo: PositionsReportInfo) => {
      const actionsToDispatch = [];
      actionsToDispatch.push(
        LoadReportColumns({
          reportColumns: positionsReportInfo.reportColumns
        })
      );
      actionsToDispatch.push(
        LoadReportParameters({
          reportParameters: positionsReportInfo.reportParameters
        })
      );

      if (positionsReportInfo.clientReportColumns.length) {
        actionsToDispatch.push(
          LoadClientReportColumns({
            clientReportColumns: positionsReportInfo.clientReportColumns
          })
        );
      } else {
        actionsToDispatch.push(
          LoadUserReportColumns({
            userReportColumns: positionsReportInfo.userReportColumns
          })
        );
        actionsToDispatch.push(
          LoadUserReportCustomAttributes({
            userReportCustomAttributes:
              positionsReportInfo.userReportCustomAttrColumns
          })
        );
        actionsToDispatch.push(
          LoadUserReportIdcColumns({
            userReportIdcColumns: positionsReportInfo.userReportIDCColumns
          })
        );
      }
      return actionsToDispatch;
    })
  ));

  constructor(
    private readonly actions$: Actions,
    private readonly positionReportInfoService: PositionsReportInfoService
  ) { }

  private addFormulaFieldFromReportColumns(
    positionsReportInfo: PositionsReportInfo
  ): PositionsReportInfo {
    return {
      ...positionsReportInfo,
      userReportColumns: positionsReportInfo.userReportColumns.map(c => {
        const reportColumn = positionsReportInfo.reportColumns.find(
          rc =>
            rc.formula != null &&
            rc.formula !== '' &&
            rc.id === c.reportColumnId
        );
        if (reportColumn) {
          c.formula = reportColumn.formula;
        }
        return c;
      })
    };
  }
}
