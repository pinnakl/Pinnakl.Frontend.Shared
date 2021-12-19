import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { ClientReport } from '../../models/reporting';
import { ClientReportFromApi } from '../../models/reporting/client-report-from-api.model';

@Injectable()
export class ClientReportService {
  private readonly _clientReportsEndpoint = 'entities/client_reports';

  constructor(private readonly wsp: WebServiceProvider) {}

  getClientReports(): Promise<ClientReport[]> {
    return this.wsp
      .getHttp<ClientReportFromApi[]>({
        endpoint: this._clientReportsEndpoint
      })
      .then(reports => reports.map(report => this.formatClientReport(report)));
  }

  async getClientReportId(clientReportName: string): Promise<any> {
    const fields = ['Id'];

    const clientReports = await this.wsp.getHttp<any[]>({
      endpoint: 'entities/clientreports',
      params: {
        fields: fields,
        filters: [
          {
            key: 'Name',
            type: 'EQ',
            value: [clientReportName]
          }
        ]
      }
    });
    return clientReports.length > 0 ? +clientReports[0].id : null;
  }

  private formatClientReport(report: ClientReportFromApi): ClientReport {
    const id = parseInt(report.id, 10),
      reportId = parseInt(report.reportid, 10);
    return new ClientReport(
      !isNaN(id) ? id : null,
      report.isinternal === 'True',
      report.reportcategory,
      !isNaN(reportId) ? reportId : null,
      report.name
    );
  }
}
