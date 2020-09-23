import { Injectable } from '@angular/core';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { UserReportFromApi } from '../../models/reporting/user-report-from-api.model';
import { UserReport } from '../../models/reporting/user-report.model';

@Injectable()
export class UserReportService {
  private readonly RESOURCE_URL = '/user_reports';

  constructor(private wsp: WebServiceProvider) {}

  deleteUserReport(id: number): Promise<void> {
    return this.wsp.delete({
      endPoint: this.RESOURCE_URL,
      payload: { id: id.toString() }
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
      ],
      getWebRequest: GetWebRequest = {
        endPoint: this.RESOURCE_URL,
        options: {
          fields,
          filters: [
            {
              key: 'userId',
              type: 'EQ',
              value: [userId.toString()]
            }
          ]
        }
      };
    return this.wsp
      .get(getWebRequest)
      .then((reports: UserReportFromApi[]) =>
        reports.map(report => this.formatUserReport(report))
      );
  }

  getUserReportsForClientReport(
    clientReportId: number,
    userId: number
  ): Promise<UserReport[]> {
    let query =
      `${
        this.RESOURCE_URL
      }?fields=ClientReportId,Id,isInternal,Name,ReportCategory,ReportId,UserId` +
      `&clientReportId=${clientReportId}&userId=${userId}`;
    const fields = [
        'ClientReportId',
        'Id',
        'isInternal',
        'Name',
        'ReportCategory',
        'ReportId',
        'UserId'
      ],
      getWebRequest: GetWebRequest = {
        endPoint: this.RESOURCE_URL,
        options: {
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
      };
    return this.wsp
      .get(getWebRequest)
      .then((reports: UserReportFromApi[]) =>
        reports.map(report => this.formatUserReport(report))
      );
  }

  postUserReport(userReport: UserReport): Promise<UserReport> {
    let userReportForRequest = this.getUserReportForServiceRequest(userReport);
    return this.wsp
      .post({ endPoint: this.RESOURCE_URL, payload: userReportForRequest })
      .then((entity: UserReportFromApi) => this.formatUserReport(entity));
  }

  putUserReport(userReport: UserReport): Promise<UserReport> {
    let userReportForRequest = this.getUserReportForServiceRequest(userReport);
    return this.wsp
      .put({ endPoint: this.RESOURCE_URL, payload: userReportForRequest })
      .then((entity: UserReportFromApi) => this.formatUserReport(entity));
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
    let clientReportId = parseInt(report.clientreportid),
      id = parseInt(report.id),
      reportId = parseInt(report.reportid),
      userId = parseInt(report.userid);
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
