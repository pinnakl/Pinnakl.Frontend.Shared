import { createAction, props } from '@ngrx/store';
import { UserReportIdcColumn } from '@pnkl-frontend/shared';

export enum UserReportIdcColumnActionTypes {
  LoadUserReportIdcColumns = '[UserReportIdcColumn] Load UserReportIdcColumns'
}


export const LoadUserReportIdcColumns = createAction(
  UserReportIdcColumnActionTypes.LoadUserReportIdcColumns,
  props<{ userReportIdcColumns: UserReportIdcColumn[] }>()
);
