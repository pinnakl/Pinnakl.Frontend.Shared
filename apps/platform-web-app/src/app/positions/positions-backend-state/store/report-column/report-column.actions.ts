import { createAction, props } from '@ngrx/store';
import { ReportColumn } from '@pnkl-frontend/shared';

export enum ReportColumnActionTypes {
  LoadReportColumns = '[ReportColumn] Load ReportColumns'
}


export const LoadReportColumns = createAction(
  ReportColumnActionTypes.LoadReportColumns,
  props<{ reportColumns: ReportColumn[] }>()
);
