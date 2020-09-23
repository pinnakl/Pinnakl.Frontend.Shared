import { Injectable } from '@angular/core';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { UserReportCustomAttributeFromApi } from '../../models/reporting/user-report-custom-attribute-from-api.model';
import { UserReportCustomAttribute } from '../../models/reporting/user-report-custom-attribute.model';
import { ReportColumnService } from './report-column.service';
import { UserReportColumnService } from './user-report-column.service';

@Injectable()
export class UserReportCustomAttributeService {
  private readonly RESOURCE_URL = 'user_report_custom_attributes';

  constructor(
    private reportColumnService: ReportColumnService,
    private userReportColumnService: UserReportColumnService,
    private wsp: WebServiceProvider
  ) {}

  deleteUserReportCustomAttribute(id: number): Promise<void> {
    return this.wsp.delete({
      endPoint: this.RESOURCE_URL,
      payload: { id: id.toString() }
    });
  }

  getUserReportCustomAttributes(
    userReportId: number
  ): Promise<UserReportCustomAttribute[]> {
    const fields = [
        'CustomAttributeId',
        'FilterValues',
        'GroupOrder',
        'Id',
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
      .then((entities: UserReportCustomAttributeFromApi[]) =>
        entities.map(entity => this.formatUserReportCustomAttribute(entity))
      );
  }

  postUserReportCustomAttribute(
    userReportCustomAttribute: UserReportCustomAttribute
  ): Promise<UserReportCustomAttribute> {
    let requestBody = this.getUserReportCustomAttributeForServiceRequest(
      userReportCustomAttribute
    );
    return this.wsp
      .post({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: UserReportCustomAttributeFromApi) =>
        this.formatUserReportCustomAttribute(entity)
      );
  }

  putUserReportCustomAttribute(
    userReportCustomAttribute: UserReportCustomAttribute
  ): Promise<UserReportCustomAttribute> {
    let requestBody = this.getUserReportCustomAttributeForServiceRequest(
      userReportCustomAttribute
    );
    return this.wsp
      .put({
        endPoint: this.RESOURCE_URL,
        payload: requestBody
      })
      .then((entity: UserReportCustomAttributeFromApi) =>
        this.formatUserReportCustomAttribute(entity)
      );
  }

  public formatUserReportCustomAttribute(
    entity: UserReportCustomAttributeFromApi
  ): UserReportCustomAttribute {
    let customAttributeId = parseInt(entity.customattributeid),
      groupOrder = parseInt(entity.grouporder),
      id = parseInt(entity.id),
      sortOrder = parseInt(entity.sortorder),
      userReportId = parseInt(entity.userreportid),
      viewOrder = parseInt(entity.vieworder);
    return new UserReportCustomAttribute(
      !isNaN(customAttributeId) ? customAttributeId : null,
      this.reportColumnService.formatFilterValues(
        entity.filtervalues,
        entity.type
      ),
      !isNaN(groupOrder) ? groupOrder : null,
      !isNaN(id) ? id : null,
      entity.isaggregating === 'True',
      entity.name,
      entity.sortascending === '' ? null : entity.sortascending === 'True',
      !isNaN(sortOrder) ? sortOrder : null,
      entity.type,
      !isNaN(userReportId) ? userReportId : null,
      !isNaN(viewOrder) ? viewOrder : null
    );
  }

  private getUserReportCustomAttributeForServiceRequest(
    entity: UserReportCustomAttribute
  ): UserReportCustomAttributeFromApi {
    let entityForApi = {} as UserReportCustomAttributeFromApi,
      {
        customAttributeId,
        filterValues,
        groupOrder,
        id,
        isAggregating,
        sortAscending,
        sortOrder,
        type,
        userReportId,
        viewOrder
      } = entity;
    if (customAttributeId !== undefined) {
      entityForApi.customattributeid = customAttributeId.toString();
    }
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
