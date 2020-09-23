import { Action } from '@ngrx/store';
import {
  ActivitySummaryModel,
  AlertModel,
  DashboardBackend
} from '../../../dashboard-backend';

export enum DashboardBackendActionTypes {
  AttemptLoadDashboardBackend = '[DashboardBackend] Attempt Load DashboardBackend',
  LoadDashboardBackend = '[DashboardBackend] Load DashboardBackend',
  LoadDashboardBackendFailed = '[DashboardBackend] Load DashboardBackend Failed',
  AttemptLoadActivitySummary = '[DashboardBackend] Attempt Load Activity Summary ',
  LoadActivitySummary = '[DashboardBackend] Load Activity Summary',
  LoadActivitySummaryFailed = '[DashboardBackend] Load Activity Summary Failed',
  AddDashboardAlert = '[DashboardBackend] Add Alert',
  RemoveDashboardAlert = '[DashboardBackend] Remove Alert'
}

export class LoadDashboardBackend implements Action {
  readonly type = DashboardBackendActionTypes.LoadDashboardBackend;
  constructor(public payload: { dashboardBackend: DashboardBackend }) {}
}

export class AttemptLoadDashboardBackend implements Action {
  readonly type = DashboardBackendActionTypes.AttemptLoadDashboardBackend;
}

export class LoadDashboardBackendFailed implements Action {
  readonly type = DashboardBackendActionTypes.LoadDashboardBackendFailed;
  constructor(public payload: { error: any }) {}
}

export class AttemptLoadActivitySummary implements Action {
  readonly type = DashboardBackendActionTypes.AttemptLoadActivitySummary;
  constructor(public payload: { startDate: Date; endDate: Date }) {}
}

export class LoadActivitySummary implements Action {
  readonly type = DashboardBackendActionTypes.LoadActivitySummary;
  constructor(public payload: { activitySummary: ActivitySummaryModel }) {}
}

export class LoadActivitySummaryFailed implements Action {
  readonly type = DashboardBackendActionTypes.LoadActivitySummaryFailed;
  constructor(public payload: { error: any }) {}
}

export class AddDashboardAlert implements Action {
  readonly type = DashboardBackendActionTypes.AddDashboardAlert;
  constructor(public payload: AlertModel) {}
}

export class RemoveDashboardAlert implements Action {
  readonly type = DashboardBackendActionTypes.RemoveDashboardAlert;
  constructor(public payload: { id: number }) {}
}

export type DashboardBackendActions =
  | AddDashboardAlert
  | AttemptLoadDashboardBackend
  | AttemptLoadActivitySummary
  | LoadActivitySummary
  | LoadActivitySummaryFailed
  | LoadDashboardBackend
  | LoadDashboardBackendFailed
  | RemoveDashboardAlert;
