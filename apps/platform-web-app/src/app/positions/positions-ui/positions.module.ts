import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PnklChartsModule } from '@pnkl-frontend/pnkl-charts';
import { ReportingModule } from '@pnkl-frontend/reporting';
import {
  CurrencyBackendStateModule,
  PinnaklGridModule,
  SharedModule,
  TradeWorkflowSpecsBackendStateModule
} from '@pnkl-frontend/shared';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ExcelModule, GridModule } from '@progress/kendo-angular-grid';
import { CheckBoxModule } from '@progress/kendo-angular-inputs';
import { TreeModule } from 'angular-tree-component';
import { SecuritiesModule } from '../../securities/securities.module';
import { PositionsUiStateModule } from '../positions-ui-state/positions-ui-state.module';
import { CreatePresetModalComponent } from './create-preset-modal/create-preset-modal';
import { PortfolioRebalanceComponent } from './portfolio-rebalance/portfolio-rebalance';
import { PositionHomeComponent } from './position-home/position-home.component';
import { PositionPopupComponent } from './position-popup';
import { PositionPopupAltComponent } from './position-popup-alt';
import { PositionRoutingModule } from './position-routing.module';
import { PositionSummaryComponent } from './position-summary/position-summary.component';
import { PositionVsPriceComponent } from './position-vs-price/position-vs-price.component';
import { NewAlertComponent } from './positions-alerts/new-alert/new-alert.component';
import { PositionsAlertsWatchlistComponent } from './positions-alerts/positions-alerts-watchlist/positions-alerts-watchlist.component';
import { PositionsAlertsComponent } from './positions-alerts/positions-alerts.component';
import { FilterColumnComponent } from './positions-filter/filter-column/filter-column.component';
import { PositionsFilterComponent } from './positions-filter/positions-filter.component';
import { ReportParameterComponent } from './positions-filter/report-parameter/report-parameter.component';
import { PositionsGridContainerComponent } from './positions-grid-container/positions-grid-container.component';
import { PositionsGridComponent } from './positions-grid/positions-grid.component';
import { PositionsHomeCashBalanceComponent } from './positions-home-cash-balance/positions-home-cash-balance.component';
import { PositionsHomeMarketValueSummaryComponent } from './positions-home-market-value-summary/positions-home-market-value-summary.component';
import { PositionsHomePnlChartComponent } from './positions-home-pnl-chart/positions-home-pnl-chart.component';
import { PositionsHomeSummaryComponent } from './positions-home-summary/positions-home-summary.component';
import { PositionsLoadAllDataGuard } from './positions-load-all-data.guard';
import { AvailableConfigColumnsComponent } from './positions-report-config/available-config-columns/available-config-columns.component';
import { AvailableIdcColumnsComponent } from './positions-report-config/available-idc-columns/available-idc-columns.component';
import { CurrencyDropdownComponent } from './positions-report-config/currency-dropdown/currency-dropdown.component';
import { PositionsReportConfigComponent } from './positions-report-config/positions-report-config.component';
import { PositionsSharePresetsComponent } from './positions-report-config/selected-config-columns/positions-share-presets/positions-share-presets.component';
import { PositionsSharePresetsService } from './positions-report-config/selected-config-columns/positions-share-presets/positions-share-presets.service';
import { SelectedConfigColumnsComponent } from './positions-report-config/selected-config-columns/selected-config-columns.component';
import { PriceComparisonComponent } from './price-comparison/price-comparison.component';
import { RebalanceOrdersComponent } from './rebalance-orders/rebalance-orders.component';
import { SaveAsModalComponent } from './save-as-selection/save-as-modal';
import { TradeHistoryComponent } from './trade-history/trade-history.component';

@NgModule({
  declarations: [
    AvailableConfigColumnsComponent,
    AvailableIdcColumnsComponent,
    CurrencyDropdownComponent,
    FilterColumnComponent,
    NewAlertComponent,
    PositionHomeComponent,
    PositionPopupComponent,
    PositionPopupAltComponent,
    PositionsFilterComponent,
    PositionsAlertsComponent,
    PositionsAlertsWatchlistComponent,
    PositionsGridComponent,
    PositionsGridContainerComponent,
    PositionsReportConfigComponent,
    PositionSummaryComponent,
    PositionsHomeSummaryComponent,
    PositionVsPriceComponent,
    PortfolioRebalanceComponent,
    PriceComparisonComponent,
    ReportParameterComponent,
    SelectedConfigColumnsComponent,
    TradeHistoryComponent,
    PositionsHomeMarketValueSummaryComponent,
    PositionsHomeCashBalanceComponent,
    PositionsHomePnlChartComponent,
    CreatePresetModalComponent,
    SaveAsModalComponent,
    PositionsSharePresetsComponent,
    RebalanceOrdersComponent
  ],
  imports: [
    CommonModule,
    CurrencyBackendStateModule,
    DatePickerModule,
    DropDownsModule,
    ExcelModule,
    FormsModule,
    GridModule,
    PinnaklGridModule,
    PositionRoutingModule,
    ReactiveFormsModule,
    ReportingModule,
    SharedModule,
    PositionsUiStateModule,
    TradeWorkflowSpecsBackendStateModule,
    TreeModule.forRoot(),
    SecuritiesModule,
    PnklChartsModule,
    DragDropModule,
    CheckBoxModule
  ],
  exports: [
    PortfolioRebalanceComponent,
    PositionSummaryComponent,
    TradeHistoryComponent,
    PositionPopupAltComponent
  ],
  providers: [
    PositionsLoadAllDataGuard,
    PositionsSharePresetsService
  ]
})
export class PositionModule {}
