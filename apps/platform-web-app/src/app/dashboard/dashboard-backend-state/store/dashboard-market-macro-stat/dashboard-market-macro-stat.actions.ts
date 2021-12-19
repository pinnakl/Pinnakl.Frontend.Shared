import { createAction, props } from '@ngrx/store';
import { DashboardMarketMacroStat } from '../../../dashboard-backend/dashboard-market-macro-stat/dashboard-market-macro-stat.model';

export enum DashboardMarketMacroStatActionTypes {
  AttemptLoadDashboardMarketMacroStats = '[DashboardMarketMacroStat] Attempt Load DashboardMarketMacroStats',
  LoadDashboardMarketMacroStats = '[DashboardMarketMacroStat] Load DashboardMarketMacroStats',
  LoadDashboardMarketMacroStatsFailed = '[DashboardMarketMacroStat] Load DashboardMarketMacroStats Failed',
  SubscribeToDashboardMarketMacroStats = '[DashboardMarketMacroStat] Subscribe to DashboardMarketMacroStats',
  UnsubscribeFromDashboardMarketMacroStats = '[DashboardMarketMacroStat] Unsubscribe from DashboardMarketMacroStats'
}

export const AttemptLoadDashboardMarketMacroStats = createAction(
  DashboardMarketMacroStatActionTypes.AttemptLoadDashboardMarketMacroStats
);

export const LoadDashboardMarketMacroStats = createAction(
  DashboardMarketMacroStatActionTypes.LoadDashboardMarketMacroStats,
  props<{ entities: DashboardMarketMacroStat[] }>()
);

export const LoadDashboardMarketMacroStatsFailed = createAction(
  DashboardMarketMacroStatActionTypes.LoadDashboardMarketMacroStatsFailed,
  props<{ error: any }>()
);

export const SubscribeToDashboardMarketMacroStats = createAction(
  DashboardMarketMacroStatActionTypes.SubscribeToDashboardMarketMacroStats
);

export const UnsubscribeFromDashboardMarketMacroStats = createAction(
  DashboardMarketMacroStatActionTypes.UnsubscribeFromDashboardMarketMacroStats
);
