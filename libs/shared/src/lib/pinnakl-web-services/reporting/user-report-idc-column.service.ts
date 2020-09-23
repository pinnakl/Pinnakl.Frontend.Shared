import { Injectable } from '@angular/core';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { UserReportIdcColumnFromApi } from '../../models/reporting/user-report-idc-column-from-api.model';
import { UserReportIdcColumn } from '../../models/reporting/user-report-idc-column.model';
import { ReportColumnService } from './report-column.service';
import { UserReportColumnService } from './user-report-column.service';

@Injectable()
export class UserReportIdcColumnService {
  private readonly RESOURCE_URL = '/user_report_idc_columns';

  constructor(
    private reportColumnService: ReportColumnService,
    private userReportColumnService: UserReportColumnService,
    private wsp: WebServiceProvider
  ) {}

  deleteUserReportIdcColumn(id: number): Promise<void> {
    return this.wsp.delete({
      endPoint: this.RESOURCE_URL,
      payload: { id: id.toString() }
    });
  }

  getUserReportIdcColumns(
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
      .then((entities: UserReportIdcColumnFromApi[]) =>
        entities.map(column => this.formatUserReportIdcColumn(column))
      );
  }

  postUserReportIdcColumn(
    reportColumn: UserReportIdcColumn
  ): Promise<UserReportIdcColumn> {
    let requestBody = this.getUserReportIdcColumnForServiceRequest(
      reportColumn
    );
    return this.wsp
      .post({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: UserReportIdcColumnFromApi) =>
        this.formatUserReportIdcColumn(entity)
      );
  }

  putUserReportIdcColumn(
    reportColumn: UserReportIdcColumn
  ): Promise<UserReportIdcColumn> {
    let requestBody = this.getUserReportIdcColumnForServiceRequest(
      reportColumn
    );
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: UserReportIdcColumnFromApi) =>
        this.formatUserReportIdcColumn(entity)
      );
  }

  public formatUserReportIdcColumn(
    entity: UserReportIdcColumnFromApi
  ): UserReportIdcColumn {
    let groupOrder = parseInt(entity.grouporder),
      id = parseInt(entity.id),
      idcColumnId = parseInt(entity.idccolumnid),
      sortOrder = parseInt(entity.sortorder),
      userReportId = parseInt(entity.userreportid),
      viewOrder = parseInt(entity.vieworder);
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
    let entityForApi = {} as UserReportIdcColumnFromApi,
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
