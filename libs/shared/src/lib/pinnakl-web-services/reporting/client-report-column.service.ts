import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { ClientReportColumnFromApi } from '../../models/reporting/client-report-column-from-api.model';
import { ClientReportColumn } from '../../models/reporting';
import { ReportColumnService } from './report-column.service';

@Injectable()
export class ClientReportColumnService {
  private readonly _clientReportColumnsEndpoint = 'entities/client_report_columns';

  constructor(
    private readonly reportColumnService: ReportColumnService,
    private readonly wsp: WebServiceProvider
  ) { }

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
      ];

    return this.wsp
      .getHttp<ClientReportColumnFromApi[]>({
        endpoint: this._clientReportColumnsEndpoint,
        params: {
          fields,
          filters: [
            {
              key: 'ClientReportId',
              type: 'EQ',
              value: [clientReportId.toString()]
            }
          ]
        }
      })
      .then(entities => entities.map(this.formatClientReportColumn.bind(this)));
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
