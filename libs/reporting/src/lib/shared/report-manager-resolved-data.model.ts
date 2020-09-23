import {
  ClientReportColumn,
  CurrencyForOMS,
  IdcColumnsObject,
  ReportColumn,
  ReportParameter,
  UserReportColumn,
  UserReportCustomAttribute,
  UserReportIdcColumn,
  CustomAttribute
} from '@pnkl-frontend/shared';

export class ReportManagerResolvedData {
  constructor(
    public clientReportColumns: ClientReportColumn[],
    public clientReportId: number,
    public currencies: CurrencyForOMS[],
    public customAttributes: CustomAttribute[],
    public idcColumns: IdcColumnsObject,
    public reportColumns: ReportColumn[],
    public reportId: number,
    public reportName: string,
    public reportParameters: ReportParameter[],
    public userReportColumns: UserReportColumn[],
    public userReportCustomAttributes: UserReportCustomAttribute[],
    public userReportId: number,
    public userReportIdcColumns: UserReportIdcColumn[]
  ) {}
}
