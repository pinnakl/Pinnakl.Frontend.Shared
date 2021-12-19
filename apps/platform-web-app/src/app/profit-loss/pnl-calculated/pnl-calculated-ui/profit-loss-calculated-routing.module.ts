import { Route } from '@angular/router';

import { AllAccountsLoadedGuard, AumLoadedGuard } from '@pnkl-frontend/shared';
import { PnlCalculatedAttributesGuard } from '../../shared/pnl-ui-state/guards/pnl-calculated-attributes.guard';
import { PnlFilterSetGuard } from '../../shared/pnl-ui-state/guards/pnl-filter-set.guard';
import { ProfitLossCalculatedComponent } from './profit-loss-calculated.component';

export const pnlCalculatedroute: Route = {
  path: 'pnl-table',
  component: ProfitLossCalculatedComponent,
  canActivate: [
    AllAccountsLoadedGuard,
    AumLoadedGuard,
    PnlCalculatedAttributesGuard,
    PnlFilterSetGuard
  ]
};

export class ProfitLossCalculatedRoutingModule {}
