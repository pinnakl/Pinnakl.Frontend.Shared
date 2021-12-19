import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import {
  ReportingColumn,
  UserReport,
  UserReportService,
  Utility,
} from '@pnkl-frontend/shared';
import { ReportingHelper } from '../../shared/reporting-helper.service';

declare let $: any;

@Component({
  selector: 'user-report-actions',
  templateUrl: 'user-report-actions.component.html'
})
export class UserReportActionsComponent {
  @Input() reportName = '';
  @Input() userReportId: number;
  @Input() savedColumns: ReportingColumn[];
  @Output() reportRenamed = new EventEmitter<string>();

  actionsVisible = false;
  confirmationVisible = false;
  hideRenameModal = true;
  constructor(
    private readonly pinnaklSpinner: PinnaklSpinner,
    private readonly reportingHelper: ReportingHelper,
    private readonly router: Router,
    private readonly toastr: Toastr,
    private readonly userReportService: UserReportService,
    private readonly utility: Utility
  ) { }

  deleteReport(): void {
    this.pinnaklSpinner.spin();
    const deleteColumnsPromise: Promise<any> = !this.savedColumns
      ? Promise.resolve()
      : Promise.all(
          this.savedColumns.map(col => this.reportingHelper.deleteColumn(col))
        );
    deleteColumnsPromise
      .then(() => this.userReportService.deleteUserReport(this.userReportId))
      .then(() => {
        this.pinnaklSpinner.stop();
        this.toastr.success('Report deleted successfully');
        this.router.navigate(['reporting/all-reports']);
      })
      .catch(this.utility.errorHandler.bind(this));
  }

  toggleRenameModal(): void {
    this.hideRenameModal = !this.hideRenameModal;
  }

  renameReport(reportName: string): void {
    let report = { id: this.userReportId, reportName } as UserReport;
    this.pinnaklSpinner.spin();
    this.userReportService
      .putUserReport(report)
      .then(() => {
        this.pinnaklSpinner.stop();
        this.toastr.success('Report renamed successfully');
        this.reportRenamed.emit(reportName);
        this.hideRenameModal = true;
      })
      .catch(this.utility.errorHandler.bind(this));
  }

  setActionsVisibility(value: boolean): void {
    this.actionsVisible = value;
  }

  showDeleteConfirmation(): void {
    this.confirmationVisible = true;
  }
}
