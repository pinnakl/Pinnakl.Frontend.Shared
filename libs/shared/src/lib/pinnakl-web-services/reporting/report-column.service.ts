import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { ReportColumnFromApi } from '../../models/reporting/report-column-from-api.model';
import { ReportColumn } from '../../models/reporting/report-column.model';

@Injectable()
export class ReportColumnService {
  private readonly RESOURCE_URL = '/report_columns';

  constructor(private wsp: WebServiceProvider) {}

  formatFilterValues(
    filterValues: string,
    type: string
  ): Date | number | string[] {
    if (!type) {
      return null;
    }
    if (type === 'numeric') {
      const value = parseFloat(filterValues);
      return !isNaN(value) ? value : null;
    } else {
      if (!filterValues) {
        return null;
      }
      if (type === 'date') {
        const valueMoment = moment(filterValues, 'MM/DD/YYYY');
        if (valueMoment.isValid()) {
          return valueMoment.toDate();
        }
        return null;
      } else {
        return JSON.parse(filterValues);
      }
    }
  }

  getReportColumns(reportId: number): Promise<ReportColumn[]> {
    const fields = [
        'Caption',
        'ConvertToBaseCurrency',
        'DecimalPlaces',
        'FilterValues',
        'GroupOrder',
        'Id',
        'IsAggregating',
        'Name',
        'RenderingFunction',
        'ReportId',
        'SortAscending',
        'SortOrder',
        'Type',
        'ViewOrder',
        'Formula'
      ],
      getWebRequest: GetWebRequest = {
        endPoint: this.RESOURCE_URL,
        options: {
          fields,
          filters: [
            { key: 'reportId', type: 'EQ', value: [reportId.toString()] }
          ]
        }
      };
    return this.wsp
      .get(getWebRequest)
      .then((entities: ReportColumnFromApi[]) =>
        entities.map(entity => this.formatReportColumn(entity))
      );
  }

  public formatReportColumn(entity: ReportColumnFromApi): ReportColumn {
    const decimalPlaces = parseInt(entity.decimalplaces, 10),
      groupOrder = parseInt(entity.grouporder, 10),
      id = parseInt(entity.id, 10),
      reportId = parseInt(entity.reportid, 10),
      sortOrder = parseInt(entity.sortorder, 10),
      viewOrder = parseInt(entity.vieworder, 10);
    return new ReportColumn(
      entity.caption,
      entity.converttobasecurrency === 'True',
      !isNaN(decimalPlaces) ? decimalPlaces : null,
      this.formatFilterValues(entity.filtervalues, entity.type),
      !isNaN(groupOrder) ? groupOrder : null,
      !isNaN(id) ? id : null,
      entity.isaggregating === 'True',
      entity.name,
      entity.renderingfunction,
      !isNaN(reportId) ? reportId : null,
      entity.sortascending === '' ? null : entity.sortascending === 'True',
      !isNaN(sortOrder) ? sortOrder : null,
      entity.type,
      entity.formula,
      !isNaN(viewOrder) ? viewOrder : null,
    );
  }
}
