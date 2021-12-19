import { createAction, props } from '@ngrx/store';
import { ReportParameter } from '@pnkl-frontend/shared';

export enum ReportParameterActionTypes {
  LoadReportParameters = '[ReportParameter] Load ReportParameters'
}


export const LoadReportParameters = createAction(
  ReportParameterActionTypes.LoadReportParameters,
  props<{ reportParameters: ReportParameter[] }>()
);
