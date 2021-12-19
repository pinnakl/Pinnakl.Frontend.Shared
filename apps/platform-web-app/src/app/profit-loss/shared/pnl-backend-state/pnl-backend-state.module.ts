import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { PnlBackendModule } from '../pnl-backend/pnl-backend.module';
import { PnlBackendStateFacade } from './pnl-backend-state-facade.service';
import { reducers } from './store';
import { PnlCalculatedAttributeEffects } from './store/pnl-calculated-attribute/pnl-calculated-attribute.effects';

@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([PnlCalculatedAttributeEffects]),
    PnlBackendModule,
    StoreModule.forFeature('pnlBackend', reducers)
  ],
  providers: [PnlBackendStateFacade]
})
export class PnlBackendStateModule {}
