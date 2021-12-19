import {
  ClientReportColumn,
  ReportColumn,
  ReportParameter,
  UserReportColumn,
  UserReportCustomAttribute,
  UserReportIdcColumn
} from '@pnkl-frontend/shared';

// report column and report params are not optional
export interface PositionsReportInfo {
  clientReportColumns?: ClientReportColumn[];
  reportColumns: ReportColumn[];
  reportParameters: ReportParameter[];
  userReportColumns?: UserReportColumn[];
  userReportCustomAttrColumns?: UserReportCustomAttribute[];
  userReportIDCColumns?: UserReportIdcColumn[];
}
