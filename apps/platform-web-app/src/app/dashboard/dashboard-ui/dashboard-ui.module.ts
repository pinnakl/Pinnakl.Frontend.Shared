import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
  DashboardService,
  TaskHistoryService
} from '../dashboard-backend/dashboard';
import { PinnaklGridModule } from '@pnkl-frontend/shared';
import { SharedModule } from '@pnkl-frontend/shared';
import { DashboardBackendStateModule } from '../dashboard-backend-state/dashboard-backend-state.module';
import { DashboardUiStateModule } from '../dashboard-ui-state/dashboard-ui-state.module';
import {
  DashboardMarketMacroStatsByTypeComponent,
  DashboardMarketMacroStatsComponent,
  RecommendedActionComponent
} from './components';
import { CustomTaskSummaryComponent } from './components/custom-tasks/custom-task-summary/custom-task-summary.component';
import { EntitySelectorComponent } from './components/custom-tasks/entity-selector/entity-selector.component';
import { ReconciliationTaskRunnerComponent } from './components/custom-tasks/reconciliation-task-runner/reconciliation-task-runner.component';
import { TradeFilesTaskRunnerComponent } from './components/custom-tasks/trade-files-task-runner/trade-files-task-runner.component';
import { ActivityFormComponent } from './containers/activity-form/activity-form.component';
import { ActivitySummaryComponent } from './containers/activity-summary/activity-summary.component';
import { AlertsComponent } from './containers/alerts/alerts.component';
import { DashboardGraphComponent } from './containers/dashboard-graph/dashboard-graph.component';
import { DashboardHomeComponent } from './containers/dashboard-home/dashboard-home.component';
import { PnlByCategoryComponent } from './containers/pnl-by-category/pnl-by-category.component';
import { PossitionSummaryComponent } from './containers/possition-summary/possition-summary.component';
import { ProfitAndLossSummaryComponent } from './containers/profit-and-loss-summary/profit-and-loss-summary.component';
import { ProfitAndLossSummaryItemComponent } from './containers/profit-and-loss-summary/profit-loss-summary-item/profit-loss-summary-item.component';
import { RecommendedActionsComponent } from './containers/recommended-actions/recommended-actions.component';
import { TaskDetailsComponent } from './containers/task-details/task-details.component';
import { TaskHeaderComponent } from './containers/task-header/task-header.component';
import { TaskHistoryComponent } from './containers/task-history/task-history.component';
import { TaskManagerComponent } from './containers/task-manager/task-manager.component';
import { TaskRunnerComponent } from './containers/task-runner/task-runner.component';
import { DashboardUiRoutingModule } from './dashboard-ui-routing.module';
import { environment } from '../../../environments';

@NgModule({
  imports: [
    CommonModule,
    DashboardUiRoutingModule,
    DashboardUiStateModule,
    DashboardBackendStateModule,
    ReactiveFormsModule,
    SharedModule,
    PinnaklGridModule,
    SharedModule.register({ fileServiceUrl: environment.fileServiceUrl })
  ],
  declarations: [
    ActivitySummaryComponent,
    AlertsComponent,
    DashboardGraphComponent,
    DashboardHomeComponent,
    DashboardMarketMacroStatsByTypeComponent,
    DashboardMarketMacroStatsComponent,
    PnlByCategoryComponent,
    PossitionSummaryComponent,
    ProfitAndLossSummaryComponent,
    ProfitAndLossSummaryItemComponent,
    RecommendedActionsComponent,
    ActivityFormComponent,
    TaskDetailsComponent,
    TaskHistoryComponent,
    TaskHeaderComponent,
    TaskManagerComponent,
    CustomTaskSummaryComponent,
    EntitySelectorComponent,
    ReconciliationTaskRunnerComponent,
    TradeFilesTaskRunnerComponent,
    TaskRunnerComponent,
    RecommendedActionComponent
  ],
  providers: [DashboardService, TaskHistoryService]
})
export class DashboardUiModule {}
