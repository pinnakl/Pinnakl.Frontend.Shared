import { createAction, props } from '@ngrx/store';
import { ClientReportColumn } from '@pnkl-frontend/shared';

export enum ClientReportColumnActionTypes {
  LoadClientReportColumns = '[ClientReportColumn] Load ClientReportColumns'
}


export const LoadClientReportColumns = createAction(
  ClientReportColumnActionTypes.LoadClientReportColumns,
  props<{ clientReportColumns: ClientReportColumn[] }>()
);
