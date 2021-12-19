import { Routes } from '@angular/router';

import {
  AllAccountsLoadedGuard,
  AumLoadedGuard,
  PositionsPnlDataFieldsLoadedGuard,
  UserScreenSettingsLoadedGuard
} from '@pnkl-frontend/shared';
import { RouteResolverComponent } from '@pnkl-frontend/shared';
import { PnlCalculatedAttributesGuard } from '../shared/pnl-ui-state/guards/pnl-calculated-attributes.guard';
import { PnlCalculatedTimeseriesLoadedGuard } from '../shared/pnl-ui-state/guards/pnl-calculated-timeseries-loaded.guard';
import { PnlFieldsSelectedGuard } from '../shared/pnl-ui-state/guards/pnl-fields-selected.guard';
import { PnlFilterSetGuard } from '../shared/pnl-ui-state/guards/pnl-filter-set.guard';
import { PnlDashboardComponent } from './pnl-dashboard.component';

export const pnlDashboardRoutes: Routes = [
  {
    path: 'pnl-dashboard',
    component: RouteResolverComponent,
    data: {
      resolvingPath: 'pnl/pnl-home/pnl-dashboard-resolved'
    }
  },
  {
    path: 'pnl-dashboard-resolved',
    component: PnlDashboardComponent,
    canActivate: [
      AllAccountsLoadedGuard,
      AumLoadedGuard,
      PnlCalculatedAttributesGuard,
      PnlCalculatedTimeseriesLoadedGuard,
      PnlFieldsSelectedGuard,
      PnlFilterSetGuard,
      PositionsPnlDataFieldsLoadedGuard,
      UserScreenSettingsLoadedGuard
    ]
  }
];
