import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { pnlCalculatedroute } from '../pnl-calculated/pnl-calculated-ui/profit-loss-calculated-routing.module';
import { pnlDashboardRoutes } from '../pnl-dashboard/pnl-dashboard-routing.module';
import { pnlRealtimeRoutes } from '../pnl-realtime/pnl-realtime.routes';
import { PnlHomeComponent } from './pnl-home.component';

const routes: Routes = [
  {
    path: 'pnl-home',
    component: PnlHomeComponent,
    children: [
      {
        path: '',
        redirectTo: 'pnl-dashboard',
        pathMatch: 'full'
      },
      pnlCalculatedroute,
      ...pnlDashboardRoutes,
      ...pnlRealtimeRoutes
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PnlHomeRoutingModule {}
