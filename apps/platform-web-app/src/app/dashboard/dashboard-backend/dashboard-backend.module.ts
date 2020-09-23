import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DashboardMarketMacroStatService } from './dashboard-market-macro-stat';
import { RecommendedActionsService } from './recommended-actions';
import { RecommendedActionsProcessingService } from './recommended-actions-processing';

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
