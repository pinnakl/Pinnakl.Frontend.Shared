import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { UserReportColumnFromApi } from '../../models/reporting/user-report-column-from-api.model';
import { UserReportColumn } from '../../models/reporting/user-report-column.model';
import { ReportColumnService } from './report-column.service';

@Injectable()
export class UserReportColumnService {
  private readonly RESOURCE_URL = 'user_report_columns';

  constructor(
    private reportColumnService: ReportColumnService,
    private wsp: WebServiceProvider
  ) {}

  deleteUserReportColumn(id: number): Promise<void> {
    return this.wsp.delete({
      endPoint: this.RESOURCE_URL,
      payload: { id: id.toString() }
    });
  }

  getFilterValuesForServiceRequest(
    filterValues: number | Date | string[],
    type: string
  ): string {
    if (filterValues === null) {
      return 'null';
    }
    if (type === 'date') {
      return moment(filterValues).format('MM/DD/YYYY');
    } else if (type === 'numeric') {
      return filterValues.toString();
    }
    return JSON.stringify(filterValues);
  }

  getUserReportColumns(userReportId: number): Promise<UserReportColumn[]> {
    const fields = [
        'Caption',
        'DecimalPlaces',
        'FilterValues',
        'GroupOrder',
        'Id',
        'IsAggregating',
        'Name',
        'RenderingFunction',
        'ReportColumnId',
        'SortAscending',
        'SortOrder',
        'Type',
        'UserReportId',
        'ViewOrder',
        'Formula'
      ],
      getWebRequest: GetWebRequest = {
        endPoint: this.RESOURCE_URL,
        options: {
          fields,
          filters: [
            {
              key: 'UserReportId',
              type: 'EQ',
              value: [userReportId.toString()]
            }
          ]
        }
      };
    return this.wsp
      .get(getWebRequest)
      .then((entities: UserReportColumnFromApi[]) =>
        entities.map(column => this.formatUserReportColumn(column))
      );
  }

  postUserReportColumn(
    reportColumn: UserReportColumn
  ): Promise<UserReportColumn> {
    const requestBody = this.getUserReportColumnForServiceRequest(reportColumn);
    return this.wsp
      .post({ endPoint: this.RESOURCE_URL, payload: requestBody })
      .then((entity: UserReportColumnFromApi) =>
        this.formatUserReportColumn(entity)
      );
  }

  putUserReportColumn(
    reportColumn: UserReportColumn
  ): Promise<UserReportColumn> {
    const requestBody = this.getUserReportColumnForServiceRequest(reportColumn);
    return this.wsp
      .put({ endPoint: this.RESOURCE_URL, payload: requestBody })
      .then((entity: UserReportColumnFromApi) =>
        this.formatUserReportColumn(entity)
      );
  }

  public formatUserReportColumn(
    entity: UserReportColumnFromApi
  ): UserReportColumn {
    const decimalPlaces = parseInt(entity.decimalplaces),
      groupOrder = parseInt(entity.grouporder),
      id = parseInt(entity.id),
      reportColumnId = parseInt(entity.reportcolumnid),
      sortOrder = parseInt(entity.sortorder),
      userReportId = parseInt(entity.userreportid),
      viewOrder = parseInt(entity.vieworder);
    return new UserReportColumn(
      entity.caption,
      !isNaN(decimalPlaces) ? decimalPlaces : null,
      this.reportColumnService.formatFilterValues(
        entity.filtervalues,
        entity.type
      ),
      !isNaN(groupOrder) ? groupOrder : null,
      !isNaN(id) ? id : null,
      entity.isaggregating === 'True',
      entity.name,
      entity.renderingfunction,
      !isNaN(reportColumnId) ? reportColumnId : null,
      entity.sortascending === '' ? null : entity.sortascending === 'True',
      !isNaN(sortOrder) ? sortOrder : null,
      entity.type,
      entity.formula,
      !isNaN(userReportId) ? userReportId : null,
      !isNaN(viewOrder) ? viewOrder : null
    );
  }

  private getUserReportColumnForServiceRequest(
    column: UserReportColumn
  ): UserReportColumnFromApi {
    const entityForApi = {} as UserReportColumnFromApi,
      {
        filterValues,
        groupOrder,
        id,
        isAggregating,
        reportColumnId,
        sortAscending,
        sortOrder,
        type,
        userReportId,
        viewOrder
      } = column;
    entityForApi.renderingfunction = column.renderingFunction
      ? column.renderingFunction
      : 'NULL';
    if (filterValues !== undefined) {
      entityForApi.filtervalues = this.getFilterValuesForServiceRequest(
        filterValues,
        type
      );
    }
    if (groupOrder !== undefined) {
      entityForApi.grouporder =
        groupOrder !== null ? groupOrder.toString() : 'null';
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (isAggregating !== undefined) {
      entityForApi.isaggregating =
        isAggregating !== null ? (isAggregating ? '1' : '0') : 'null';
    }
    if (reportColumnId !== undefined) {
      entityForApi.reportcolumnid = reportColumnId.toString();
    }
    if (sortAscending !== undefined) {
      entityForApi.sortascending =
        sortAscending !== null ? (sortAscending ? '1' : '0') : 'null';
    }
    if (sortOrder !== undefined) {
      entityForApi.sortorder =
        sortOrder !== null ? sortOrder.toString() : 'null';
    }
    if (userReportId !== undefined) {
      entityForApi.userreportid = userReportId.toString();
    }
    if (viewOrder !== undefined) {
      entityForApi.vieworder =
        viewOrder !== null ? viewOrder.toString() : 'null';
    }
    return entityForApi;
  }
}
