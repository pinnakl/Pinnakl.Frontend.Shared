import { createAction, props } from '@ngrx/store';
import { UserReportColumn } from '@pnkl-frontend/shared';

export enum UserReportColumnActionTypes {
  LoadUserReportColumns = '[UserReportColumn] Load UserReportColumns'
}


export const LoadUserReportColumns = createAction(
  UserReportColumnActionTypes.LoadUserReportColumns,
  props<{ userReportColumns: UserReportColumn[] }>()
);
