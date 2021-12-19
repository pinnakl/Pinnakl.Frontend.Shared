import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';

import { PositionsReportParameterValue } from './positions-report-parameter-value.model';

export enum PositionsReportParameterValueActionTypes {
  LoadPositionsReportParameterValues = '[PositionsReportParameterValue] Load PositionsReportParameterValues',
  UpdatePositionsReportParameterValues = '[PositionsReportParameterValue] Update PositionsReportParameterValues'
}


export const LoadPositionsReportParameterValues = createAction(
  PositionsReportParameterValueActionTypes.LoadPositionsReportParameterValues,
  props<{ positionsReportParameterValues: PositionsReportParameterValue[] }>()
);

export const UpdatePositionsReportParameterValues = createAction(
  PositionsReportParameterValueActionTypes.UpdatePositionsReportParameterValues,
  props<{ positionsReportParameterValues: Update<PositionsReportParameterValue>[] }>()
);
