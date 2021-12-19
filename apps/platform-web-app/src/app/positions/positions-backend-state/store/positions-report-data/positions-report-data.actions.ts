import { createAction, props } from '@ngrx/store';
import { PositionsReportDataFilter } from './positions-report-data-filter.model';

export enum PositionsReportDataActionTypes {
  AddManyPositionsReportData = '[PositionsReportData] Add Many PositionsReportData',
  AddPositionsReportData = '[PositionsReportData] Add PositionsReportData',
  AttemptLoadPositionsReportData = '[PositionsReportData] Attempt Load PositionsReportData', // Service call for attemping
  LoadPositionsReportData = '[PositionsReportData] Load PositionsReportData', // Service call for initial
  LoadPositionsReportDataFailed = '[PositionsReportData] Load PositionsReportDataFailed', // fail
  UpdateManyPositionsReportData = '[PositionsReportData] Update Many PositionsReportData',
  UpdateManyPriceReportData = '[PositionsReportData] Update Many PriceReportData',
  UpdatePositionsReportData = '[PositionsReportData] Update PositionsReportData'
}


export const AddManyPositionsReportData = createAction(
  PositionsReportDataActionTypes.AddManyPositionsReportData,
  props<{ reportDataToAdd: any[] }>()
);

export const AddPositionsReportData = createAction(
  PositionsReportDataActionTypes.AddPositionsReportData,
  props<{ reportDataToAdd: any }>()
);

export const AttemptLoadPositionsReportData = createAction(
  PositionsReportDataActionTypes.AttemptLoadPositionsReportData,
  props<{ payload: PositionsReportDataFilter }>()
);

export const LoadPositionsReportData = createAction(
  PositionsReportDataActionTypes.LoadPositionsReportData,
  props<{ positionsReportData: any[] }>()
);

export const LoadPositionsReportDataFailed = createAction(
  PositionsReportDataActionTypes.LoadPositionsReportDataFailed,
  props<{ error: any }>()
);

export const UpdateManyPositionsReportData = createAction(
  PositionsReportDataActionTypes.UpdateManyPositionsReportData,
  props<{ reportDataToUpdate: any[] }>()
);

export const UpdateManyPriceReportData = createAction(
  PositionsReportDataActionTypes.UpdateManyPriceReportData,
  props<{ reportDataToUpdate: any[] }>()
);

export const UpdatePositionsReportData = createAction(
  PositionsReportDataActionTypes.UpdatePositionsReportData,
  props<{ reportDataToUpdate: any }>()
);
