import { createAction, props } from '@ngrx/store';
import { ActivitySummaryModel } from '../../../dashboard-backend/dashboard/activity-summary.model';
import { AlertModel } from '../../../dashboard-backend/dashboard/alert.model';
import { DashboardBackend } from '../../../dashboard-backend/dashboard/dashboard-backend.model';

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


export const LoadDashboardBackend = createAction(
  DashboardBackendActionTypes.LoadDashboardBackend,
  props<{ dashboardBackend: DashboardBackend }>()
);

export const AttemptLoadDashboardBackend = createAction(
  DashboardBackendActionTypes.AttemptLoadDashboardBackend
);

export const LoadDashboardBackendFailed = createAction(
  DashboardBackendActionTypes.LoadDashboardBackendFailed,
  props<{ error: any }>()
);

export const AttemptLoadActivitySummary = createAction(
  DashboardBackendActionTypes.AttemptLoadActivitySummary,
  props<{ startDate: Date; endDate: Date }>()
);

export const LoadActivitySummary = createAction(
  DashboardBackendActionTypes.LoadActivitySummary,
  props<{ activitySummary: ActivitySummaryModel }>()
);

export const LoadActivitySummaryFailed = createAction(
  DashboardBackendActionTypes.LoadActivitySummaryFailed,
  props<{ error: any }>()
);

export const AddDashboardAlert = createAction(
  DashboardBackendActionTypes.AddDashboardAlert,
  props<{ payload: AlertModel }>()
);

export const RemoveDashboardAlert = createAction(
  DashboardBackendActionTypes.RemoveDashboardAlert,
  props<{ id: number }>()
);
