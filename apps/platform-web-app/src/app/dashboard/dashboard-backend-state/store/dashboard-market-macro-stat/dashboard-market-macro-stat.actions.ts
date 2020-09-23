import { Action } from '@ngrx/store';

import { DashboardMarketMacroStat } from '../../../dashboard-backend';

export enum DashboardMarketMacroStatActionTypes {
  AttemptLoadDashboardMarketMacroStats = '[DashboardMarketMacroStat] Attempt Load DashboardMarketMacroStats',
  LoadDashboardMarketMacroStats = '[DashboardMarketMacroStat] Load DashboardMarketMacroStats',
  LoadDashboardMarketMacroStatsFailed = '[DashboardMarketMacroStat] Load DashboardMarketMacroStats Failed',
  SubscribeToDashboardMarketMacroStats = '[DashboardMarketMacroStat] Subscribe to DashboardMarketMacroStats',
  UnsubscribeFromDashboardMarketMacroStats = '[DashboardMarketMacroStat] Unsubscribe from DashboardMarketMacroStats'
}

export class AttemptLoadDashboardMarketMacroStats implements Action {
  readonly type =
    DashboardMarketMacroStatActionTypes.AttemptLoadDashboardMarketMacroStats;
}

export class LoadDashboardMarketMacroStats implements Action {
  readonly type =
    DashboardMarketMacroStatActionTypes.LoadDashboardMarketMacroStats;
  constructor(public payload: { entities: DashboardMarketMacroStat[] }) {}
}

export class LoadDashboardMarketMacroStatsFailed implements Action {
  readonly type =
    DashboardMarketMacroStatActionTypes.LoadDashboardMarketMacroStatsFailed;
  constructor(public payload: { error: any }) {}
}

export class SubscribeToDashboardMarketMacroStats implements Action {
  readonly type =
    DashboardMarketMacroStatActionTypes.SubscribeToDashboardMarketMacroStats;
}

export class UnsubscribeFromDashboardMarketMacroStats implements Action {
  readonly type =
    DashboardMarketMacroStatActionTypes.UnsubscribeFromDashboardMarketMacroStats;
}

export type DashboardMarketMacroStatActions =
  | AttemptLoadDashboardMarketMacroStats
  | LoadDashboardMarketMacroStats
  | LoadDashboardMarketMacroStatsFailed
  | SubscribeToDashboardMarketMacroStats
  | UnsubscribeFromDashboardMarketMacroStats;
