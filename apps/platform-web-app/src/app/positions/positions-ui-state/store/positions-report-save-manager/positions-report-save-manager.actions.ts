import { createAction, props } from '@ngrx/store';

import {
  ClientReportColumn,
  ReportingColumn,
  UserReportColumn,
  UserReportCustomAttribute,
  UserReportIdcColumn
} from '@pnkl-frontend/shared';

export enum PositionsReportSaveManagerActionTypes {
  AttemptSavePositionsReport = '[PositionsReportSaveManager] Attempt Save PositionsReport',
  SavePositionsReport = '[PositionsReportSaveManager] Save PositionsReport',
  SavePositionsReportFailed = '[PositionsReportSaveManager] Save PositionsReport Failed'
}


export const AttemptSavePositionsReport = createAction(
  PositionsReportSaveManagerActionTypes.AttemptSavePositionsReport,
  props<{
    clientReportColumns: ClientReportColumn[];
    reportId: number;
    selectedColumns: ReportingColumn[];
    userReportColumns: UserReportColumn[];
    userReportIdcColumns: UserReportIdcColumn[];
    userReportCustomAttributes: UserReportCustomAttribute[];
  }>()
);

export const SavePositionsReport = createAction(
  PositionsReportSaveManagerActionTypes.SavePositionsReport,
  props<{
    userReportColumns: UserReportColumn[];
    userReportIdcColumns: UserReportIdcColumn[];
    userReportCustomAttributes: UserReportCustomAttribute[];
  }>()
);

export const SavePositionsReportFailed = createAction(
  PositionsReportSaveManagerActionTypes.SavePositionsReportFailed,
  props<{ error: any }>()
);
