import { ClientReport, UserReport } from '@pnkl-frontend/shared';
export class ReportGroup {
  constructor(
    public reportCategory: string,
    public clientReportList: ClientReport[],
    public userReportList: UserReport[]
  ) {}
}
