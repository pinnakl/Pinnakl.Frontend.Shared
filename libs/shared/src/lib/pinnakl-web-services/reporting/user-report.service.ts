import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { UserReport, UserReportFromApi } from '../../models/reporting';

@Injectable()
export class UserReportService {
  private readonly _userReportsEndpoint = 'entities/user_reports';

  constructor(private readonly wsp: WebServiceProvider) {}

  deleteUserReport(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._userReportsEndpoint}/${id}`
    });
  }

  getUserReports(userId: number): Promise<UserReport[]> {
    const fields = [
      'ClientReportId',
      'Id',
      'isInternal',
      'Name',
      'ReportCategory',
      'ReportId',
      'UserId'
    ];

    return this.wsp
      .getHttp<UserReportFromApi[]>({
        endpoint: this._userReportsEndpoint,
        params: {
          fields,
          filters: [
            {
              key: 'isDevUser',
              type: 'EQ',
              value: ['0']
            }
          ]
        }
      })
      .then(reports => reports.map(this.formatUserReport));
  }

  getUserReportsForClientReport(
    clientReportId: number,
    userId: number
  ): Promise<UserReport[]> {
    const fields = [
      'ClientReportId',
      'Id',
      'isInternal',
      'Name',
      'ReportCategory',
      'ReportId',
      'UserId'
    ];
    return this.wsp
      .getHttp<UserReportFromApi[]>({
        endpoint: this._userReportsEndpoint,
        params: {
          fields,
          filters: [
            {
              key: 'clientReportId',
              type: 'EQ',
              value: [clientReportId.toString()]
            },
            {
              key: 'userId',
              type: 'EQ',
              value: [userId.toString()]
            }
          ]
        }
      })
      .then(reports => reports.map(this.formatUserReport));
  }

  postUserReport(userReport: UserReport): Promise<UserReport> {
    const userReportForRequest = this.getUserReportForServiceRequest(
      userReport
    );
    return this.wsp
      .postHttp<UserReportFromApi>({
        endpoint: this._userReportsEndpoint,
        body: userReportForRequest
      })
      .then(this.formatUserReport);
  }

  putUserReport(userReport: UserReport): Promise<UserReport> {
    const userReportForRequest = this.getUserReportForServiceRequest(
      userReport
    );
    return this.wsp
      .putHttp<UserReportFromApi>({
        endpoint: this._userReportsEndpoint,
        body: userReportForRequest
      })
      .then(this.formatUserReport);
  }

  private getUserReportForServiceRequest(
    userReport: UserReport
  ): UserReportFromApi {
    let entityForApi = {} as UserReportFromApi,
      {
        clientReportId,
        id,
        isPnklInternal,
        reportName,
        reportId,
        userId
      } = userReport;
    if (clientReportId !== undefined) {
      entityForApi.clientreportid = clientReportId.toString();
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (isPnklInternal !== undefined) {
      entityForApi.isinternal = isPnklInternal.toString();
    }
    if (reportName !== undefined) {
      entityForApi.name = reportName;
    }
    if (reportId !== undefined) {
      entityForApi.reportid = reportId.toString();
    }
    if (userId !== undefined) {
      entityForApi.userid = userId.toString();
    }
    return entityForApi;
  }

  private formatUserReport(report: UserReportFromApi): UserReport {
    const id = parseInt(report.id, 10);
    const userId = parseInt(report.userid, 10);
    const reportId = parseInt(report.reportid, 10);
    const clientReportId = parseInt(report.clientreportid, 10);
    return new UserReport(
      !isNaN(clientReportId) ? clientReportId : null,
      !isNaN(id) ? id : null,
      report.isinternal === 'True',
      report.reportcategory,
      report.name,
      !isNaN(reportId) ? reportId : null,
      !isNaN(userId) ? userId : null
    );
  }
}
