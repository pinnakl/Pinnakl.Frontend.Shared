import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { UserReportIdcColumn } from '../../models/reporting';
import { UserReportIdcColumnFromApi } from '../../models/reporting/user-report-idc-column-from-api.model';
import { ReportColumnService } from './report-column.service';
import { UserReportColumnService } from './user-report-column.service';

@Injectable()
export class UserReportIdcColumnService {
  private readonly _userReportIDCColumnsEndpoint =
    'entities/user_report_idc_columns';

  constructor(
    private readonly reportColumnService: ReportColumnService,
    private readonly userReportColumnService: UserReportColumnService,
    private readonly wsp: WebServiceProvider
  ) { }

  async deleteUserReportIdcColumn(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._userReportIDCColumnsEndpoint}/${id}`
    });
  }

  async getUserReportIdcColumns(
    userReportId: number
  ): Promise<UserReportIdcColumn[]> {
    const fields = [
      'Caption',
      'FilterValues',
      'GroupOrder',
      'Id',
      'IdcColumnId',
      'IsAggregating',
      'Name',
      'SortAscending',
      'SortOrder',
      'Type',
      'UserReportId',
      'ViewOrder'
    ];

    const userReportIDCColumns = await this.wsp.getHttp<
      UserReportIdcColumnFromApi[]
    >({
      endpoint: this._userReportIDCColumnsEndpoint,
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
    });
    return userReportIDCColumns.map(this.formatUserReportIdcColumn);
  }

  async postUserReportIdcColumn(
    reportColumn: UserReportIdcColumn
  ): Promise<UserReportIdcColumn> {
    const entity = await this.wsp.postHttp<UserReportIdcColumnFromApi>({
      endpoint: this._userReportIDCColumnsEndpoint,
      body: this.getUserReportIdcColumnForServiceRequest(reportColumn)
    });

    return this.formatUserReportIdcColumn(entity);
  }

  async putUserReportIdcColumn(
    reportColumn: UserReportIdcColumn
  ): Promise<UserReportIdcColumn> {
    const entity = await this.wsp.putHttp<UserReportIdcColumnFromApi>({
      endpoint: this._userReportIDCColumnsEndpoint,
      body: this.getUserReportIdcColumnForServiceRequest(reportColumn)
    });

    return this.formatUserReportIdcColumn(entity);
  }

  public formatUserReportIdcColumn(
    entity: UserReportIdcColumnFromApi
  ): UserReportIdcColumn {
    const groupOrder = parseInt(entity.grouporder, 10),
      id = parseInt(entity.id, 10),
      idcColumnId = parseInt(entity.idccolumnid, 10),
      sortOrder = parseInt(entity.sortorder, 10),
      userReportId = parseInt(entity.userreportid, 10),
      viewOrder = parseInt(entity.vieworder, 10);
    return new UserReportIdcColumn(
      entity.caption,
      this.reportColumnService.formatFilterValues(
        entity.filtervalues,
        entity.type
      ),
      !isNaN(groupOrder) ? groupOrder : null,
      !isNaN(id) ? id : null,
      !isNaN(idcColumnId) ? idcColumnId : null,
      entity.isaggregating === 'True',
      entity.name,
      entity.sortascending === '' ? null : entity.sortascending === 'True',
      !isNaN(sortOrder) ? sortOrder : null,
      entity.type,
      !isNaN(userReportId) ? userReportId : null,
      !isNaN(viewOrder) ? viewOrder : null
    );
  }

  private getUserReportIdcColumnForServiceRequest(
    column: UserReportIdcColumn
  ): UserReportIdcColumnFromApi {
    const entityForApi = {} as UserReportIdcColumnFromApi,
      {
        filterValues,
        groupOrder,
        id,
        idcColumnId,
        isAggregating,
        sortAscending,
        sortOrder,
        type,
        userReportId,
        viewOrder
      } = column;
    if (filterValues !== undefined) {
      entityForApi.filtervalues = this.userReportColumnService.getFilterValuesForServiceRequest(
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
    if (idcColumnId !== undefined) {
      entityForApi.idccolumnid = idcColumnId.toString();
    }
    if (isAggregating !== undefined) {
      entityForApi.isaggregating =
        isAggregating !== null ? (isAggregating ? '1' : '0') : 'null';
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
