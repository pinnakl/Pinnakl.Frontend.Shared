import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardMarketMacroStatService } from './dashboard-market-macro-stat/dashboard-market-macro-stat.service';
import { RecommendedActionsProcessingService } from './recommended-actions-processing/recommended-actions-processing.service';
import { RecommendedActionsService } from './recommended-actions/recommended-actions.service';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [
    DashboardMarketMacroStatService,
    RecommendedActionsService,
    RecommendedActionsProcessingService
  ]
})
export class DashboardBackendModule {}
