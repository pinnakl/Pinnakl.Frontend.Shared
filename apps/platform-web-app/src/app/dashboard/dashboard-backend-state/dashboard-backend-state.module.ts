import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { DashboardBackendModule } from '../dashboard-backend';
import { RecommendedActionsLoadedGuard } from './guards';
import * as fromState from './store';
import { DashboardBackendEffects } from './store/dashboard/dashboard-backend.effects';
import { RecommendedActionEffects } from './store/recommended-actions/recommended-actions.effects';

@NgModule({
  imports: [
    DashboardBackendModule,
    StoreModule.forFeature('dashboardBackend', fromState.reducers),
    EffectsModule.forFeature([
      DashboardBackendEffects,
      fromState.DashboardMarketMacroStatEffects,
      RecommendedActionEffects
    ])
  ],
  declarations: [],
  providers: [RecommendedActionsLoadedGuard]
})
export class DashboardBackendStateModule {}
