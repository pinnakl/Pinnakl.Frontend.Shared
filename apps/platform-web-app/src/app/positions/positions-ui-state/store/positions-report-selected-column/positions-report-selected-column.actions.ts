import { createAction, props } from '@ngrx/store';

import { ReportingColumn } from '@pnkl-frontend/shared';

export enum PositionsReportSelectedColumnActionTypes {
  AddPositionsReportSelectedColumns = '[PositionsReportSelectedColumn] Add PositionsReportSelectedColumns',
  DeletePositionsReportSelectedColumns = '[PositionsReportSelectedColumn] Delete PositionsReportSelectedColumns',
  LoadPositionsReportSelectedColumns = '[PositionsReportSelectedColumn] Load PositionsReportSelectedColumns',
  SelectDefaultPositionsReportSelectedColumns = '[PositionsReportSelectedColumn] Select Default PositionsReportSelectedColumns',
  UpdatePositionsReportSelectedColumns = '[PositionsReportSelectedColumn] Update PositionsReportSelectedColumns'
}

export const AddPositionsReportSelectedColumns = createAction(
  PositionsReportSelectedColumnActionTypes.AddPositionsReportSelectedColumns,
  props<{ positionsReportSelectedColumns: ReportingColumn[] }>()
);

export const DeletePositionsReportSelectedColumns = createAction(
  PositionsReportSelectedColumnActionTypes.DeletePositionsReportSelectedColumns,
  props<{
    payload: {
      positionsReportSelectedColumns: {
        name: string;
        reportingColumnType: string;
      }[];
    }
  }>()
);

export const LoadPositionsReportSelectedColumns = createAction(
  PositionsReportSelectedColumnActionTypes.LoadPositionsReportSelectedColumns,
  props<{ positionsReportSelectedColumns: ReportingColumn[] }>()
);

export const SelectDefaultPositionsReportSelectedColumns = createAction(
  PositionsReportSelectedColumnActionTypes.SelectDefaultPositionsReportSelectedColumns
);

export const UpdatePositionsReportSelectedColumns = createAction(
  PositionsReportSelectedColumnActionTypes.UpdatePositionsReportSelectedColumns,
  props<{ positionsReportSelectedColumns: Partial<ReportingColumn>[]; }>()
);
