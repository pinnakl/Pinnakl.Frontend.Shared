import { createAction, props } from '@ngrx/store';
import { IdcColumn } from '@pnkl-frontend/shared';

export enum IdcColumnActionTypes {
  AttemptLoadIdcColumns = '[IdcColumn] Attempt Load IdcColumns',
  LoadIdcColumns = '[IdcColumn] Load IdcColumns',
  LoadIdcColumnsFailed = '[IdcColumn] Load IdcColumns Failed'
}


export const AttemptLoadIdcColumns = createAction(
  IdcColumnActionTypes.AttemptLoadIdcColumns
);

export const LoadIdcColumns = createAction(
  IdcColumnActionTypes.LoadIdcColumns,
  props<{ idcColumns: IdcColumn[] }>()
);

export const LoadIdcColumnsFailed = createAction(
  IdcColumnActionTypes.LoadIdcColumnsFailed,
  props<{ error: any }>()
);
