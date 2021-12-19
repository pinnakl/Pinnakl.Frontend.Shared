import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TreeModule } from 'angular-tree-component';

import {
  PinnaklGridModule,
  SharedModule
} from '@pnkl-frontend/shared';
import { AllReportsRoutingModule } from './all-reports/all-reports-routing.module';
import { AllReportsComponent } from './all-reports/all-reports.component';
import { FILE_SERVICE_URL_REPORTING } from './enviroment.tokens';
import { ManagerReportsRoutingModule } from './manager-reports/manager-reports-routing.module';
import { ManagerReportsComponent } from './manager-reports/manager-reports.component';
import { ReportingManagerRoutingModule } from './report-manager/report-manager-routing.module';
import { ReportManagerComponent } from './report-manager/report-manager.component';
import { ReportNameEditorComponent } from './report-manager/report-name-editor/report-name-editor.component';
import { ReportingConfigComponent } from './report-manager/reporting-config/reporting-config.component';
import { ReportingExportManagerComponent } from './report-manager/reporting-export-manager/reporting-export-manager.component';
import { UserReportActionsComponent } from './report-manager/user-report-actions/user-report-actions.component';
import { UserReportSaveManagerComponent } from './report-manager/user-report-save-manager/user-report-save-manager.component';
import { ReportingHelper } from './shared/reporting-helper.service';
import { SetFileServiceUrl } from './shared/set-file-service-url.service';

@NgModule({
  declarations: [
    AllReportsComponent,
    ManagerReportsComponent,
    ReportingConfigComponent,
    ReportingExportManagerComponent,
    ReportManagerComponent,
    ReportNameEditorComponent,
    UserReportActionsComponent,
    UserReportSaveManagerComponent
  ],
  imports: [
    SharedModule,
    AllReportsRoutingModule,
    CommonModule,
    FormsModule,
    ManagerReportsRoutingModule,
    PinnaklGridModule,
    ReactiveFormsModule,
    ReportingManagerRoutingModule,
    SharedModule,
    TreeModule.forRoot()
  ],
  providers: [ReportingHelper, SetFileServiceUrl],
  exports: [
    ReportingConfigComponent,
    UserReportSaveManagerComponent,
    AllReportsComponent,
    ManagerReportsComponent,
    ReportingConfigComponent,
    ReportingExportManagerComponent,
    ReportManagerComponent,
    ReportNameEditorComponent,
    UserReportActionsComponent,
    UserReportSaveManagerComponent
  ]
})
export class ReportingModule {
  public static register({ fileServiceUrl }): ModuleWithProviders<ReportingModule> {
    return {
      ngModule: ReportingModule,
      providers: [
        { provide: FILE_SERVICE_URL_REPORTING, useValue: fileServiceUrl }
      ]
    };
  }
}
