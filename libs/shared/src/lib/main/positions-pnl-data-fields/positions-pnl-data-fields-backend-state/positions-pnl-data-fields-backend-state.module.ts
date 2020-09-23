import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { PositionsPnlDataFieldsBackendModule } from '../positions-pnl-data-fields-backend';
import { PositionsPnlDataFieldsLoadedGuard } from './guards';
import { PositionsPnlDataFieldsBackendStateFacade } from './positions-pnl-data-fields-backend-state-facade.service';
import { PositionsPnlDataFieldsEffects, reducer } from './store';

@NgModule({
  imports: [
    EffectsModule.forFeature([PositionsPnlDataFieldsEffects]),
    PositionsPnlDataFieldsBackendModule,
    StoreModule.forFeature('positionsPnlDataFieldsBackend', reducer)
  ],
  providers: [
    PositionsPnlDataFieldsBackendStateFacade,
    PositionsPnlDataFieldsLoadedGuard
  ]
})
export class PositionsPnlDataFieldsBackendStateModule {}
