import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RouteResolverComponent } from '@pnkl-frontend/shared';
import { PositionHomeComponent } from './position-home/position-home.component';
import { PositionHomeResolver } from './position-home/position-home.resolver';
import { PositionsLoadAllDataGuard } from './positions-load-all-data.guard';

const routes: Routes = [
  {
    path: '',
    component: RouteResolverComponent,
    data: {
      headerClass: 'height-8',
      title: 'Loading Report',
      resolvingPath: 'pms/positions-resolver'
    }
  },
  {
    path: 'positions-resolver',
    component: PositionHomeComponent,
    resolve: {
      resolvedData: PositionHomeResolver
    },
    canActivate: [
      PositionsLoadAllDataGuard
    ],
    data: {
      requiredEstablishedStreamsCount: 3
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [PositionHomeResolver]
})
export class PositionRoutingModule {}
