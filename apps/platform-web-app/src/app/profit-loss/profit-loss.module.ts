import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';

import { PnklChartsModule } from '@pnkl-frontend/pnkl-charts';
import { ReportingModule } from '@pnkl-frontend/reporting';
import { PinnaklGridModule } from '@pnkl-frontend/shared';
import { SharedModule } from '@pnkl-frontend/shared';
import { PnlHomeRoutingModule } from './pnl-home/pnl-home-routing.module';
import { PnlBackendStateModule } from './shared/pnl-backend-state/pnl-backend-state.module';

import { DashboardService } from '../dashboard/shared/dashboard.service';
import { PositionsBackendModule } from '../positions/positions-backend/positions-backend.module';
import { PositionsUiStateModule } from '../positions/positions-ui-state/positions-ui-state.module';
import { PnlCalculatedColumnsComponent } from './pnl-calculated/pnl-calculated-columns/pnl-calculated-columns.component';
import { PnlCalculatedFilterComponent } from './pnl-calculated/pnl-calculated-filter/pnl-calculated-filter.component';
import { ProfitLossCalculatedComponent } from './pnl-calculated/pnl-calculated-ui/profit-loss-calculated.component';
import { PnlAddWidgetComponent } from './pnl-dashboard/pnl-add-widget/pnl-add-widget.component';
import { PnlCalculatedTimeseriesChartComponent } from './pnl-dashboard/pnl-calculated-timeseries-chart/pnl-calculated-timeseries-chart.component';
import { PnlCalculatedTimeseriesFilterComponent } from './pnl-dashboard/pnl-calculated-timeseries-filter/pnl-calculated-timeseries-filter.component';
import { PnlCalculatedTimeseriesComponent } from './pnl-dashboard/pnl-calculated-timeseries/pnl-calculated-timeseries.component';
import { PnlChartSwitchComponent } from './pnl-dashboard/pnl-chart-switch/pnl-chart-switch.component';
import { PnlDashboardComponent } from './pnl-dashboard/pnl-dashboard.component';
import { PnlTopMoverComponent } from './pnl-dashboard/pnl-top-mover/pnl-top-mover.component';
import { PnlWidgetViewSelectorComponent } from './pnl-dashboard/pnl-widget-view-selector/pnl-widget-view-selector.component';
import { PnlWidgetComponent } from './pnl-dashboard/pnl-widget/pnl-widget.component';
import { PnlHomeComponent } from './pnl-home/pnl-home.component';
import { PnlRealtimeFieldSelectorComponent } from './pnl-realtime/pnl-realtime-field-selector/pnl-realtime-field-selector.component';
import { PnlRealtimeComponent } from './pnl-realtime/pnl-realtime/pnl-realtime.component';
import { PnlFilterComponent } from './shared/pnl-filter/pnl-filter.component';
import { ProfitLossHeaderComponentComponent } from './shared/pnl-header/profit-loss-header-component.component';
import { PnlUiStateModule } from './shared/pnl-ui-state/pnl-ui-state.module';

@NgModule({
  declarations: [
    PnlAddWidgetComponent,
    PnlCalculatedColumnsComponent,
    PnlCalculatedFilterComponent,
    PnlCalculatedTimeseriesChartComponent,
    PnlChartSwitchComponent,
    PnlCalculatedTimeseriesComponent,
    PnlCalculatedTimeseriesFilterComponent,
    PnlDashboardComponent,
    PnlFilterComponent,
    PnlHomeComponent,
    PnlRealtimeComponent,
    PnlRealtimeFieldSelectorComponent,
    PnlTopMoverComponent,
    PnlWidgetComponent,
    ProfitLossCalculatedComponent,
    ProfitLossHeaderComponentComponent,
    PnlWidgetViewSelectorComponent
  ],
  imports: [
    CommonModule,
    DatePickerModule,
    DialogModule,
    FormsModule,
    PinnaklGridModule,
    PnklChartsModule,
    PnlBackendStateModule,
    PnlHomeRoutingModule,
    PnlUiStateModule,
    PositionsBackendModule,
    PositionsUiStateModule,
    ReactiveFormsModule,
    ReportingModule,
    SharedModule
  ],
  providers: [DashboardService]
})
export class ProfitLossModule {}
