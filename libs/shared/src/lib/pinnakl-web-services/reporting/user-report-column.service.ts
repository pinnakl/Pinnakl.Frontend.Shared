import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { UserReportColumn } from '../../models/reporting';
import { UserReportColumnFromApi } from '../../models/reporting/user-report-column-from-api.model';
import { ReportColumnService } from './report-column.service';

@Injectable()
export class UserReportColumnService {
  private readonly _userReportColumnsEndpoint = 'entities/user_report_columns';

  constructor(
    private readonly reportColumnService: ReportColumnService,
    private readonly wsp: WebServiceProvider
  ) { }

  async deleteUserReportColumn(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._userReportColumnsEndpoint}/${id}`
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

  async getUserReportColumns(
    userReportId: number
  ): Promise<UserReportColumn[]> {
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
      'ViewOrder'
    ];

    const userReportColumns = await this.wsp.getHttp<UserReportColumnFromApi[]>(
      {
        endpoint: this._userReportColumnsEndpoint,
        params: {
          fields: fields,
          filters: [
            {
              key: 'UserReportId',
              type: 'EQ',
              value: [userReportId.toString()]
            }
          ]
        }
      }
    );

    return userReportColumns.map(this.formatUserReportColumn.bind(this));
  }

  async postUserReportColumn(
    reportColumn: UserReportColumn
  ): Promise<UserReportColumn> {
    const entity = await this.wsp.postHttp<UserReportColumnFromApi>({
      endpoint: this._userReportColumnsEndpoint,
      body: this.getUserReportColumnForServiceRequest(reportColumn)
    });

    return this.formatUserReportColumn(entity);
  }

  async putUserReportColumn(
    reportColumn: UserReportColumn
  ): Promise<UserReportColumn> {
    const entity = await this.wsp.putHttp<UserReportColumnFromApi>({
      endpoint: this._userReportColumnsEndpoint,
      body: this.getUserReportColumnForServiceRequest(reportColumn)
    });

    return this.formatUserReportColumn(entity);
  }

  public formatUserReportColumn(
    entity: UserReportColumnFromApi
  ): UserReportColumn {
    const decimalPlaces = parseInt(entity.decimalplaces, 10),
      groupOrder = parseInt(entity.grouporder, 10),
      id = parseInt(entity.id, 10),
      reportColumnId = parseInt(entity.reportcolumnid, 10),
      sortOrder = parseInt(entity.sortorder, 10),
      userReportId = parseInt(entity.userreportid, 10),
      viewOrder = parseInt(entity.vieworder, 10);
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
