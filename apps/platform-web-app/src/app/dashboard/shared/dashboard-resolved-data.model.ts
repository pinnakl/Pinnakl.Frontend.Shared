import { ClientConnectivity } from '@pnkl-frontend/shared';
import { Notification } from './notification.model';
import { Stats } from './stats.model';
import { TaskObject } from './task-object.model';

export class DashboardResolvedData {
  constructor(
    public entities: ClientConnectivity[],
    public notifications: Notification[],
    public stats: Stats,
    public tasks: TaskObject[]
  ) {}
}
