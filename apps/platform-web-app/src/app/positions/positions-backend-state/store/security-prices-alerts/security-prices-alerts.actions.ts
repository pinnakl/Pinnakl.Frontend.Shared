import { createAction, props } from '@ngrx/store';
import { SecurityPriceAlert } from '@pnkl-frontend/shared';

export enum SecurityPriceAlertActionTypes {
  AttemptLoadSecurityPriceAlerts = '[SecurityPriceAlert] Attempt Load SecurityPriceAlerts',
  LoadSecurityPriceAlerts = '[SecurityPriceAlert] Load SecurityPriceAlerts',
  LoadSecurityPriceAlertsFailed = '[SecurityPriceAlert] Load SecurityPriceAlerts Failed'
}


export const AttemptLoadSecurityPriceAlerts = createAction(
  SecurityPriceAlertActionTypes.AttemptLoadSecurityPriceAlerts
);

export const LoadSecurityPriceAlerts = createAction(
  SecurityPriceAlertActionTypes.LoadSecurityPriceAlerts,
  props<{ securityPriceAlerts: SecurityPriceAlert[] }>()
);

export const LoadSecurityPriceAlertsFailed = createAction(
  SecurityPriceAlertActionTypes.LoadSecurityPriceAlertsFailed,
  props<{ error: any }>()
);
