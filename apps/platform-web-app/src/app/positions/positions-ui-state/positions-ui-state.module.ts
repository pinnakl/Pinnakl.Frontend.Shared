import { DatePipe, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { PositionHomeService } from './../positions-ui/position-home/position-home.service';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import {
  AccountsBackendStateModule,
  AumBackendStateModule
} from '@pnkl-frontend/shared';
import { PositionsBackendStateModule } from '../positions-backend-state/positions-backend-state.module';
import { PositionsUiStateFacade } from './positions-ui-state-facade.service';
import {
  reducers
} from './store';
import { PositionsFilterEffects } from './store/positions-filter/positions-filter.effects';
import { PositionsGridEffects } from './store/positions-grid/positions-grid.effects';
import { PositionsReportParameterValueEffects } from './store/positions-report-parameter-value/positions-report-parameter-value.effects';
import { PositionsReportSaveHelper } from './store/positions-report-save-manager/positions-report-save-helper.service';
import { PositionsReportSaveManagerEffects } from './store/positions-report-save-manager/positions-report-save-manager.effects';
import { PositionsReportSelectedColumnEffects } from './store/positions-report-selected-column/positions-report-selected-column.effects';
import { RealTimePortfolioStatusEffects } from './store/real-time-portfolio-status/real-time-portfolio-status.effects';
import { RealTimePriceEffects } from './store/real-time-price/real-time-price.effects';
import { SelectedCurrencyEffects } from './store/selected-currency/selected-currency.effects';
import * as fromSelectedCurrency from './store/selected-currency/selected-currency.reducer';

@NgModule({
  imports: [
    EffectsModule.forFeature([
      PositionsFilterEffects,
      PositionsGridEffects,
      PositionsReportParameterValueEffects,
      PositionsReportSaveManagerEffects,
      PositionsReportSelectedColumnEffects,
      RealTimePortfolioStatusEffects,
      RealTimePriceEffects,
      SelectedCurrencyEffects
    ]),
    AccountsBackendStateModule,
    AumBackendStateModule,
    PositionsBackendStateModule,
    StoreModule.forFeature('positionsUi', reducers),
    StoreModule.forFeature('selectedCurrency', fromSelectedCurrency.reducer)
  ],
  providers: [
    DatePipe,
    DecimalPipe,
    PositionsReportSaveHelper,
    PositionsUiStateFacade
  ]
})
export class PositionsUiStateModule {}
