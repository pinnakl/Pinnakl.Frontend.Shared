import { ManagerReportsReportOptions } from '../manager-reports/manager-reports-report-options.model';
import * as moment from 'moment';

export class ManagerReportsResolvedData {
  public generatedReportDates: Date[];
  public managerReportsReportOptions: ManagerReportsReportOptions;
  public reports: string[];

  constructor() {
    this.generatedReportDates = [
      moment()
        .subtract(3, 'month')
        .endOf('month')
        .toDate(),
      moment()
        .subtract(4, 'month')
        .endOf('month')
        .toDate()
    ];
    this.managerReportsReportOptions = new ManagerReportsReportOptions();
    this.reports = [
      'Positions with MV',
      'Trade Report Aggregate',
      'Risk Analytics',
      'Carry'
    ];
  }
}
