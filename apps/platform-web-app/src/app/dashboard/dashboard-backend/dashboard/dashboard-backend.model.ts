import { ClientConnectivity } from '@pnkl-frontend/shared';
import { TaskObject } from '../../shared/task-object.model';
import { ActivitySummaryModel } from './activity-summary.model';
import { AlertModel } from './alert.model';
import { PnlModel } from './pnl.model';

export interface DashboardBackend {
  pnl: PnlModel;
  actions: string[];
  alerts: AlertModel[];
  activitySummary: ActivitySummaryModel;
  clientConnectivity: ClientConnectivity[];
  fulfilledTasks: TaskObject[];
}
