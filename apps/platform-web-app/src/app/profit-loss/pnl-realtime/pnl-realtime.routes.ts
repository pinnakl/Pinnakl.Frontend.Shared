import { Routes } from '@angular/router';

import {
  AllAccountsLoadedGuard,
  AumLoadedGuard,
  PositionsPnlDataFieldsLoadedGuard,
  UserScreenSettingsLoadedGuard
} from '@pnkl-frontend/shared';
import { RouteResolverComponent } from '@pnkl-frontend/shared';
import { PnlFieldsSelectedGuard } from '../shared/pnl-ui-state/guards/pnl-fields-selected.guard';
import { PnlFilterSetGuard } from '../shared/pnl-ui-state/guards/pnl-filter-set.guard';
import { PnlRealtimeComponent } from './pnl-realtime/pnl-realtime.component';

export const pnlRealtimeRoutes: Routes = [
  {
    path: 'pnl-heatmap',
    component: RouteResolverComponent,
    data: {
      resolvingPath: 'pnl/pnl-home/pnl-heatmap-resolved'
    }
  },
  {
    path: 'pnl-heatmap-resolved',
    component: PnlRealtimeComponent,
    canActivate: [
      AllAccountsLoadedGuard,
      AumLoadedGuard,
      PnlFieldsSelectedGuard,
      PnlFilterSetGuard,
      // TODO; remove it later if everything will works fine on pnl-runtime screen
      // PnlRealtimeFilterSetGuard,
      PositionsPnlDataFieldsLoadedGuard,
      UserScreenSettingsLoadedGuard
    ],
    data: {
      requiredEstablishedStreamsCount: 2
    }
  }
];
