import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import {
  ReportingColumn,
  UserReport,
  UserReportService,
  Utility,
  ReportingHelper
} from '@pnkl-frontend/shared';

declare let $: any;

@Component({
  selector: 'user-report-actions',
  templateUrl: 'user-report-actions.component.html'
})
export class UserReportActionsComponent {
  @Input() reportName = '';
  @Input() userReportId: number;
  @Input() private savedColumns: ReportingColumn[];
  @Output() reportRenamed = new EventEmitter<string>();

  actionsVisible = false;
  confirmationVisible = false;
  hideRenameModal = true;
  constructor(
    private pinnaklSpinner: PinnaklSpinner,
    private reportingHelper: ReportingHelper,
    private router: Router,
    private toastr: Toastr,
    private userReportService: UserReportService,
    private utility: Utility
  ) {}

  deleteReport(): void {
    this.pinnaklSpinner.spin();
    let deleteColumnsPromise: Promise<any> = !this.savedColumns
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
      .then(ur => {
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
