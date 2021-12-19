import { createAction, props } from '@ngrx/store';
import { PositionsReportInfo } from '../../../positions-backend/positions-report-info/positions-report-info.model';

export enum PositionReportInfoActionTypes {
  AttemptLoadPositionReportInfo = '[PositionReportInfo] Attempt Load PositionReportInfo',
  LoadPositionReportInfo = '[PositionReportInfo] Load PositionReportInfo',
  LoadPositionReportInfoFailed = '[PositionReportInfo] Load PositionReportInfo Failed'
}


export const AttemptLoadPositionReportInfo = createAction(
  PositionReportInfoActionTypes.AttemptLoadPositionReportInfo
);

export const LoadPositionReportInfo = createAction(
  PositionReportInfoActionTypes.LoadPositionReportInfo,
  props<{ positionsReportInfo: PositionsReportInfo }>()
);

export const LoadPositionReportInfoFailed = createAction(
  PositionReportInfoActionTypes.LoadPositionReportInfoFailed,
  props<{ error: any }>()
);
