import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import * as moment from 'moment';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { ManagerReportsReportOptions } from '../manager-reports/manager-reports-report-options.model';
import { ManagerReportsResolvedData } from '../manager-reports/manager-reports-resolved-data.model';
import {
  ReportOptions,
  ReportParameter,
  ReportingService,
  Utility
} from '@pnkl-frontend/shared';

@Component({
  selector: 'manager-reports',
  templateUrl: 'manager-reports.component.html',
  styleUrls: ['manager-reports.component.scss']
})
export class ManagerReportsComponent implements OnInit {
  form: FormGroup;
  generatedReportDates: Date[];
  reports: string[];
  submitted = false;

  private managerReportsReportOptions: ManagerReportsReportOptions;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private pinnaklSpinner: PinnaklSpinner,
    private reportingService: ReportingService,
    private utility: Utility
  ) {}

  exportReport(date: Date, excel: boolean, report: string): void {
    const params = this.getReportParameters(date, report),
      ro = this.getReportOptions(report);
    this.pinnaklSpinner.spin();
    this.reportingService
      .exportAndDownloadReport(
        undefined,
        report,
        !!excel,
        ro.id,
        params,
        ro.reportingColumns
      )
      .then(() => this.pinnaklSpinner.stop())
      .catch(this.utility.errorHandler.bind(this));
  }

  generateReport(): void {
    this.submitted = true;
    if (!this.form.valid) {
      return;
    }
    const date = moment(this.form.value.date)
        .endOf('month')
        .toDate(),
      dateExists = this.generatedReportDates.some(
        existingDate =>
          existingDate.getMonth() === date.getMonth() &&
          existingDate.getFullYear() === date.getFullYear()
      );
    if (dateExists) {
      return;
    }
    this.pinnaklSpinner.spin();
    setTimeout(() => {
      this.pinnaklSpinner.stop();
      this.generatedReportDates.unshift(date);
    }, 600);
  }

  ngOnInit(): void {
    this.assignResolvedData();
    this.form = this.createForm();
  }

  private assignResolvedData(): void {
    const resolvedData = this.activatedRoute.snapshot.data
      .resolvedData as ManagerReportsResolvedData;
    this.generatedReportDates = resolvedData.generatedReportDates;
    this.managerReportsReportOptions = resolvedData.managerReportsReportOptions;
    this.reports = resolvedData.reports;
  }

  private createForm(): FormGroup {
    return this.fb.group({ date: [new Date(), Validators.required] });
  }

  private getReportOptions(reportName: string): ReportOptions {
    switch (reportName) {
      case 'Positions with MV':
        return this.managerReportsReportOptions.positionsWithMv;
      case 'Trade Report Aggregate':
        return this.managerReportsReportOptions.tradesReportAggregate;
      case 'Risk Analytics':
        return this.managerReportsReportOptions.riskAnalytics;
      case 'Carry':
        return this.managerReportsReportOptions.carry;
      default:
        return null;
    }
  }

  private getReportParameters(
    date: Date,
    reportName: string
  ): ReportParameter[] {
    switch (reportName) {
      case 'Positions with MV':
        return [
          { name: 'posdate', type: 'date', value: date } as ReportParameter
        ];
      case 'Trade Report Aggregate':
        return [
          { name: 'enddate', type: 'date', value: date } as ReportParameter,
          {
            name: 'startdate',
            type: 'date',
            value: moment(date)
              .startOf('month')
              .toDate()
          } as ReportParameter
        ];
      case 'Risk Analytics':
        return [
          { name: 'posdate', type: 'date', value: date } as ReportParameter
        ];
      case 'Carry':
        return [
          { name: 'positiondate', type: 'date', value: date } as ReportParameter
        ];
      default:
        return null;
    }
  }
}
