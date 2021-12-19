import { Component, ElementRef, HostListener, Input } from '@angular/core';

import { GridOptions } from 'ag-grid-community';

import { Toastr } from '@pnkl-frontend/core';
import {
  ReportingColumn,
  ReportingService,
  ReportParameter,
  Utility
} from '@pnkl-frontend/shared';
import { ReportingHelper } from '../../shared/reporting-helper.service';

@Component({
  selector: 'reporting-export-manager',
  templateUrl: 'reporting-export-manager.component.html'
})
export class ReportingExportManagerComponent {
  @Input() exportMenuVisible = false;
  @Input() private clientReportId: number;
  @Input() private filterColumns: ReportingColumn[] = [];
  @Input() private gridOptions: GridOptions;
  @Input() private reportId: number;
  @Input() private reportName = '';
  @Input() private reportParameters: ReportParameter[] = [];

  constructor(
    private readonly reportingHelper: ReportingHelper,
    private readonly reportingService: ReportingService,
    private readonly toastr: Toastr,
    private readonly utility: Utility,
    private readonly eRef: ElementRef
  ) { }

  @HostListener('document:click', ['$event'])
  documentClick(event: any): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.exportMenuVisible = false;
    }
  }

  exportReport(exportToExcel: boolean): void {
    const columns = this.reportingHelper.getColumnsFromGridAndFilterToSave(
      this.filterColumns,
      this.gridOptions
    );
    this.exportMenuVisible = false;
    this.toastr.success('The report will be downloaded automatically');
    this.reportingService
      .exportAndDownloadReport(
        this.clientReportId,
        this.reportName,
        exportToExcel,
        this.reportId,
        this.reportParameters,
        columns
      )
      .then(() => this.toastr.success('Report exported successfully'))
      .catch(this.utility.errorHandler.bind(this));
  }
}
