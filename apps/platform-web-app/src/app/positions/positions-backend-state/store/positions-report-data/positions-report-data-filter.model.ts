import { ReportingColumn, ReportParameter } from '@pnkl-frontend/shared';

export interface PositionsReportDataFilter {
  id: number;
  params: ReportParameter[];
  reportingColumns: ReportingColumn[];
}
