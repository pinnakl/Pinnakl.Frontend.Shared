import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { IdcColumnsLoadedGuard } from './guards/idc-columns-loaded.guard';
import { PositionsReportDataLoadedGuard } from './guards/positions-report-data-loaded.guard';
import { PositionsReportInfoLoadedGuard } from './guards/positions-report-info-loaded.guard';
import { SecurityCustomAttributesLoadedGuard } from './guards/security-custom-attributes-loaded.guard';
import { PositionsBackendStateFacade } from './positions-backend-state-facade.service';
import { PositionsPnlValuesSavingService } from './positions-pnl-values-saving.service';
import { reducers } from './store';
import { AllDataEffects } from './store/all-data/all-data.effects';
import { CustomAttributeEffects } from './store/custom-attribute/custom-attribute.effects';
import { IdcColumnEffects } from './store/idc-column/idc-column.effects';
import { PositionReportInfoEffects } from './store/position-report-info/position-report-info.effects';
import { PositionsPnlValuesEffects } from './store/positions-pnl-values/positions-pnl-values.effects';
import { PositionsReportDataEffects } from './store/positions-report-data/positions-report-data.effects';
import { SecurityPriceAlertEffects } from './store/security-prices-alerts/security-prices-alert.effects';
import { WatchlistItemEffects } from './store/watchlist-items/watchlist-items.effects';

@NgModule({
  imports: [
    // PositionsBackendModule,
    EffectsModule.forFeature([
      CustomAttributeEffects,
      IdcColumnEffects,
      PositionsReportDataEffects,
      PositionReportInfoEffects,
      SecurityPriceAlertEffects,
      WatchlistItemEffects,
      AllDataEffects,
      PositionsPnlValuesEffects
    ]),
    StoreModule.forFeature('positionsBackend', reducers)
  ],
  providers: [
    IdcColumnsLoadedGuard,
    PositionsReportInfoLoadedGuard,
    PositionsReportDataLoadedGuard,
    PositionsBackendStateFacade,
    SecurityCustomAttributesLoadedGuard,
    PositionsPnlValuesSavingService
  ]
})
export class PositionsBackendStateModule {}
