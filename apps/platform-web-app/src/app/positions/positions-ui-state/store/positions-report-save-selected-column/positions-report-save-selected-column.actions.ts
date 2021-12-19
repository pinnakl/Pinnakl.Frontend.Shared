import { createAction, props } from '@ngrx/store';

import { ReportingColumn } from '@pnkl-frontend/shared';

export enum PositionsReportSaveSelectedColumnActionTypes {
  AddPositionsReportSaveSelectedColumns = '[PositionsReportSaveSelectedColumn] Add PositionsReportSaveSelectedColumns',
  DeletePositionsReportSaveSelectedColumns = '[PositionsReportSaveSelectedColumn] Delete PositionsReportSaveSelectedColumns',
  LoadPositionsReportSaveSelectedColumns = '[PositionsReportSaveSelectedColumn] Load PositionsReportSaveSelectedColumns',
  UpdatePositionsReportSaveSelectedColumns = '[PositionsReportSaveSelectedColumn] Update PositionsReportSaveSelectedColumns'
}

export const AddPositionsReportSaveSelectedColumns = createAction(
  PositionsReportSaveSelectedColumnActionTypes.AddPositionsReportSaveSelectedColumns,
  props<{ positionsReportSelectedColumns: ReportingColumn[] }>()
);

export const DeletePositionsReportSaveSelectedColumns = createAction(
  PositionsReportSaveSelectedColumnActionTypes.DeletePositionsReportSaveSelectedColumns,
  props<{
    payload: {
      positionsReportSelectedColumns: {
        name: string;
        reportingColumnType: string;
      }[];
    }
  }>()
);

export const LoadPositionsReportSaveSelectedColumns = createAction(
  PositionsReportSaveSelectedColumnActionTypes.LoadPositionsReportSaveSelectedColumns,
  props<{ positionsReportSelectedColumns: ReportingColumn[] }>()
);

export const UpdatePositionsReportSaveSelectedColumns = createAction(
  PositionsReportSaveSelectedColumnActionTypes.UpdatePositionsReportSaveSelectedColumns,
  props<{ positionsReportSelectedColumns: Partial<ReportingColumn>[] }>()
);
