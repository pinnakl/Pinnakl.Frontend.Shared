import { ReportingColumn } from './reporting-column.model';

export class ReportOptions {
  public clientReportId: number;
  public exportedFileName: string;
  public exportToExcel: boolean;
  public exportToPdf: boolean;
  public id: number;
  public parameters: object;
  public reportingColumns: ReportingColumn[];
}
