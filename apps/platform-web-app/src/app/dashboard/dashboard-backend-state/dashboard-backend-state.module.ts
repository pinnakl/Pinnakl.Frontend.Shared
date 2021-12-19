import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { DashboardBackendModule } from '../dashboard-backend/dashboard-backend.module';
import { RecommendedActionsLoadedGuard } from './guards/recommended-actions-loaded.guard';
import * as fromState from './store';
import { DashboardMarketMacroStatEffects } from './store/dashboard-market-macro-stat/dashboard-market-macro-stat.effects';
import { DashboardBackendEffects } from './store/dashboard/dashboard-backend.effects';
import { RecommendedActionEffects } from './store/recommended-actions/recommended-actions.effects';

@NgModule({
  imports: [
    DashboardBackendModule,
    StoreModule.forFeature('dashboardBackend', fromState.reducers),
    EffectsModule.forFeature([
      DashboardBackendEffects,
      DashboardMarketMacroStatEffects,
      RecommendedActionEffects
    ])
  ],
  declarations: [],
  providers: [RecommendedActionsLoadedGuard]
})
export class DashboardBackendStateModule {}
