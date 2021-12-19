import { createAction, props } from '@ngrx/store';
import { UserReportCustomAttribute } from '@pnkl-frontend/shared';

export enum UserReportCustomAttributeActionTypes {
  LoadUserReportCustomAttributes = '[UserReportCustomAttribute] Load UserReportCustomAttributes'
}


export const LoadUserReportCustomAttributes = createAction(
  UserReportCustomAttributeActionTypes.LoadUserReportCustomAttributes,
  props<{ userReportCustomAttributes: UserReportCustomAttribute[] }>()
);
