import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { DashboardStateFacadeService } from './dashboard-state-facade.service';
import { DashboardUiEffects } from './dashboardEffects/dashboard-ui.effects';
import { RecommendedActionProcessingEffects } from './recommended-actions-processing';

@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([
      DashboardUiEffects,
      RecommendedActionProcessingEffects
    ])
  ],
  declarations: [],
  providers: [DashboardStateFacadeService]
})
export class DashboardUiStateModule {}
