import { Injectable } from '@angular/core';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { ClientReportColumnFromApi } from '../../models/reporting/client-report-column-from-api.model';
import { ClientReportColumn } from '../../models/reporting/client-report-column.model';
import { ReportColumnService } from './report-column.service';

@Injectable()
export class ClientReportColumnService {
  private readonly RESOURCE_URL = '/client_report_columns';

  constructor(
    private reportColumnService: ReportColumnService,
    private wsp: WebServiceProvider
  ) {}

  getClientReportColumns(
    clientReportId: number
  ): Promise<ClientReportColumn[]> {
    const fields = [
        'Caption',
        'ClientReportId',
        'DecimalPlaces',
        'FilterValues',
        'GroupOrder',
        'Id',
        'IsAggregating',
        'Name',
        'ReportColumnId',
        'SortAscending',
        'SortOrder',
        'Type',
        'ViewOrder'
      ],
      getWebRequest: GetWebRequest = {
        endPoint: this.RESOURCE_URL,
        options: {
          fields,
          filters: [
            {
              key: 'ClientReportId',
              type: 'EQ',
              value: [clientReportId.toString()]
            }
          ]
        }
      };

    return this.wsp
      .get(getWebRequest)
      .then((entities: ClientReportColumnFromApi[]) =>
        entities.map(entity => this.formatClientReportColumn(entity))
      );
  }

  public formatClientReportColumn(
    entity: ClientReportColumnFromApi
  ): ClientReportColumn {
    const clientReportId = parseInt(entity.clientreportid, 10),
      decimalPlaces = parseInt(entity.decimalplaces, 10),
      groupOrder = parseInt(entity.grouporder, 10),
      id = parseInt(entity.id, 10),
      reportColumnId = parseInt(entity.reportcolumnid, 10),
      sortOrder = parseInt(entity.sortorder, 10),
      viewOrder = parseInt(entity.vieworder, 10);
    return new ClientReportColumn(
      entity.caption,
      !isNaN(clientReportId) ? clientReportId : null,
      !isNaN(decimalPlaces) ? decimalPlaces : null,
      this.reportColumnService.formatFilterValues(
        entity.filtervalues,
        entity.type
      ),
      !isNaN(groupOrder) ? groupOrder : null,
      !isNaN(id) ? id : null,
      entity.isaggregating === 'True',
      entity.name,
      !isNaN(reportColumnId) ? reportColumnId : null,
      entity.sortascending === '' ? null : entity.sortascending === 'True',
      !isNaN(sortOrder) ? sortOrder : null,
      entity.type,
      !isNaN(viewOrder) ? viewOrder : null,
    );
  }
}
