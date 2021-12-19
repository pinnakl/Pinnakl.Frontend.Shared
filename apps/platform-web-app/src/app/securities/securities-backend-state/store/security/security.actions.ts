import { createAction, props } from '@ngrx/store';
import { Security } from '@pnkl-frontend/shared';

export enum SecurityActionTypes {
  AttemptLoadSecurities = '[Security] Attempt Load Securities',
  LoadSecurities = '[Security] Load Securities',
  LoadSecuritiesFailed = '[Security] Load Securities Failed'
}


export const AttemptLoadSecurities = createAction(
  SecurityActionTypes.AttemptLoadSecurities
);

export const LoadSecurities = createAction(
  SecurityActionTypes.LoadSecurities,
  props<{ securities: Security[] }>()
);

export const LoadSecuritiesFailed = createAction(
  SecurityActionTypes.LoadSecuritiesFailed,
  props<{ error: any }>()
);
