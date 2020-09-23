import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { TradeWorkflowSpecsBackendModule } from '../trade-workflow-specs-backend';
import { AllTradeWorkflowSpecsLoadedGuard } from './guards';
import { reducers, TradeWorkflowSpecEffects } from './store';
import { TradeWorkflowSpecsBackendStateFacade } from './trade-workflow-specs-backend-state-facade.service';

@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([TradeWorkflowSpecEffects]),
    StoreModule.forFeature('tradeWorkflowSpecsBackend', reducers),
    TradeWorkflowSpecsBackendModule
  ],
  providers: [
    AllTradeWorkflowSpecsLoadedGuard,
    TradeWorkflowSpecsBackendStateFacade
  ]
})
export class TradeWorkflowSpecsBackendStateModule {}
