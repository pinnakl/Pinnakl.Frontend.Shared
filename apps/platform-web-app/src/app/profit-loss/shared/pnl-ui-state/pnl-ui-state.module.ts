import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import {
  AccountsBackendStateModule,
  AumBackendStateModule,
  PositionsPnlDataFieldsBackendStateModule,
  UserScreenSettingsBackendStateModule
} from '@pnkl-frontend/shared';
import { PnlCalculatedAttributesGuard } from './guards/pnl-calculated-attributes.guard';
import { PnlCalculatedTimeseriesLoadedGuard } from './guards/pnl-calculated-timeseries-loaded.guard';
import { PnlFieldsSelectedGuard } from './guards/pnl-fields-selected.guard';
import { PnlFilterSetGuard } from './guards/pnl-filter-set.guard';
import { PnlRealtimeFilterSetGuard } from './guards/pnl-realtime-filter-set.guard';
import { PnlUiStateFacadeService } from './pnl-ui-state-facade.service';
import {
  PnlFiltersEffects,
  PnlFiltersUiEffects,
  RealTimePnlEffects,
  reducers
} from './store';

@NgModule({
  imports: [
    AccountsBackendStateModule,
    AumBackendStateModule,
    CommonModule,
    PositionsPnlDataFieldsBackendStateModule,
    EffectsModule.forFeature([
      PnlFiltersEffects,
      PnlFiltersUiEffects,
      RealTimePnlEffects
    ]),
    StoreModule.forFeature('pnlUi', reducers),
    UserScreenSettingsBackendStateModule
  ],
  providers: [
    PnlCalculatedAttributesGuard,
    PnlCalculatedTimeseriesLoadedGuard,
    PnlFieldsSelectedGuard,
    PnlFilterSetGuard,
    PnlRealtimeFilterSetGuard,
    PnlUiStateFacadeService
  ]
})
export class PnlUiStateModule {}
