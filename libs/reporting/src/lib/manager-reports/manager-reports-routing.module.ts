import { Injectable, NgModule } from '@angular/core';
import { Resolve, RouterModule, Routes } from '@angular/router';

import { ManagerReportsResolvedData } from '../manager-reports/manager-reports-resolved-data.model';
import { RouteResolverComponent } from '@pnkl-frontend/shared';
import { ManagerReportsComponent } from './manager-reports.component';

@Injectable()
export class ManagerReportsResolve
  implements Resolve<ManagerReportsResolvedData> {
  resolve(): ManagerReportsResolvedData {
    return new ManagerReportsResolvedData();
  }
}

const routes: Routes = [
  {
    path: 'manager-reports',
    component: RouteResolverComponent,
    data: {
      title: 'Reporting',
      resolvingPath: 'reporting/manager-reports-resolved'
    }
  },
  {
    path: 'manager-reports-resolved',
    component: ManagerReportsComponent,
    resolve: {
      resolvedData: ManagerReportsResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ManagerReportsResolve]
})
export class ManagerReportsRoutingModule {}
