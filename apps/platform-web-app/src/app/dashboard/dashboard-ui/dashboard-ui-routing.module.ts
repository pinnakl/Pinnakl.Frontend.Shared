import { Injectable, NgModule } from '@angular/core';
import { Resolve, RouterModule, Routes } from '@angular/router';
import { DashboardGuard } from './guards/dashboard-guard.service';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { ClientConnectivity } from '@pnkl-frontend/shared';
import { ClientConnectivityService } from '@pnkl-frontend/shared';
import { DashboardService } from '../dashboard-backend/dashboard/dashboard.service';
import { DashboardResolvedData } from '../shared/dashboard-resolved-data.model';
import { TaskObject } from '../shared/task-object.model';
import { DashboardHomeComponent } from './containers/dashboard-home/dashboard-home.component';
import { DashboardMarketMaroStatsLoadedGuard } from './guards';

@Injectable()
export class
DashboardResolve
  implements Resolve<{ entities: ClientConnectivity[]; tasks: TaskObject[] }> {
  constructor(
    private readonly clientConnectivityService: ClientConnectivityService,
    private readonly dashboardService: DashboardService,
    private readonly spinner: PinnaklSpinner
  ) {}

  resolve(): Promise<{ entities: ClientConnectivity[]; tasks: TaskObject[] }> {
    this.spinner.spin();
    const resolvedData = {} as DashboardResolvedData;
    return Promise.all([
      this.clientConnectivityService.getClientConnectivities(),
      this.dashboardService.getTaskObjects()
    ]).then(result => {
      this.spinner.stop();
      const [clientConnectivities, tasks] = result;
      resolvedData.entities = clientConnectivities;
      resolvedData.tasks = tasks;
      return resolvedData;
    });
  }
}

const routes: Routes = [
  {
    path: '',
    canActivate: [
      DashboardGuard,
      DashboardMarketMaroStatsLoadedGuard
      // RecommendedActionsLoadedGuard
    ],
    component: DashboardHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    DashboardGuard,
    DashboardMarketMaroStatsLoadedGuard,
    DashboardResolve
  ]
})
export class DashboardUiRoutingModule {}
