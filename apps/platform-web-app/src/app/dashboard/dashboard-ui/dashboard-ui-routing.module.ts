import { Injectable, NgModule } from '@angular/core';
import { Resolve, RouterModule, Routes } from '@angular/router';
import { DashoardGuard } from './guards/dashoard.guard';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { DashboardHomeComponent } from '../dashboard-ui/containers/dashboard-home/dashboard-home.component';
import { ClientConnectivity } from '@pnkl-frontend/shared';
import { AccountService } from '@pnkl-frontend/shared';
import { ClientConnectivityService } from '@pnkl-frontend/shared';
import { RecommendedActionsLoadedGuard } from '../dashboard-backend-state';
import { DashboardService } from '../dashboard-backend/dashboard/dashboard.service';
import { DashboardResolvedData } from '../shared/dashboard-resolved-data.model';
import { TaskObject } from '../shared/task-object.model';
import { DashboardMarketMaroStatsLoadedGuard } from './guards';
@Injectable()
export class DashboardResolve
  implements Resolve<{ entities: ClientConnectivity[]; tasks: TaskObject[] }> {
  constructor(
    private accountService: AccountService,
    private clientConnectivityService: ClientConnectivityService,
    private dashboardService: DashboardService,
    private spinner: PinnaklSpinner
  ) {}

  resolve(): Promise<{ entities: ClientConnectivity[]; tasks: TaskObject[] }> {
    this.spinner.spin();
    let resolvedData = {} as DashboardResolvedData;
    return Promise.all([
      this.clientConnectivityService.getClientConnectivities(),
      this.dashboardService.getTaskObjects()
    ]).then(result => {
      this.spinner.stop();
      let [clientConnectivities, tasks] = result;
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
      DashoardGuard,
      DashboardMarketMaroStatsLoadedGuard,
      RecommendedActionsLoadedGuard
    ],
    component: DashboardHomeComponent,
    resolve: {
      resolvedData: DashboardResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    DashoardGuard,
    DashboardMarketMaroStatsLoadedGuard,
    DashboardResolve
  ]
})
export class DashboardUiRoutingModule {}
