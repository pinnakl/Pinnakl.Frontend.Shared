import { Injectable } from '@angular/core';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { ClientReportFromApi } from '../../models/reporting/client-report-from-api.model';
import { ClientReport } from '../../models/reporting/client-report.model';

@Injectable()
export class ClientReportService {
  private readonly RESOURCE_URL = '/client_reports';

  constructor(private wsp: WebServiceProvider) {}

  getClientReports(): Promise<ClientReport[]> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL
    };
    return this.wsp
      .get(getWebRequest)
      .then((reports: ClientReportFromApi[]) =>
        reports.map(report => this.formatClientReport(report))
      );
  }

  getClientReportId(clientReportName: string): Promise<any> {
    let fields = ['Id'];
    const getWebRequest: GetWebRequest = {
      endPoint: 'clientreports',
      options: {
        fields: fields,
        filters: [
          {
            key: 'Name',
            type: 'EQ',
            value: [clientReportName]
          }
        ]
      }
    };
    return this.wsp.get(getWebRequest).then(result => {
      if (result.length > 0) {
        return parseInt(result[0].id);
      } else {
        return null;
      }
    });
  }

  private formatClientReport(report: ClientReportFromApi): ClientReport {
    let id = parseInt(report.id),
      reportId = parseInt(report.reportid);
    return new ClientReport(
      !isNaN(id) ? id : null,
      report.isinternal === 'True',
      report.reportcategory,
      !isNaN(reportId) ? reportId : null,
      report.name
    );
  }
}
