import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { UserReportCustomAttribute } from '../../models/reporting';
import { UserReportCustomAttributeFromApi } from '../../models/reporting/user-report-custom-attribute-from-api.model';
import { ReportColumnService } from './report-column.service';
import { UserReportColumnService } from './user-report-column.service';

@Injectable()
export class UserReportCustomAttributeService {
  private readonly _userReportCustomAttributesEndpoint = 'entities/user_report_custom_attributes';

  constructor(
    private readonly reportColumnService: ReportColumnService,
    private readonly userReportColumnService: UserReportColumnService,
    private readonly wsp: WebServiceProvider
  ) { }

  async deleteUserReportCustomAttribute(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._userReportCustomAttributesEndpoint}/${id}`
    });
  }

  async getUserReportCustomAttributes(
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
      ];

    const entities = await this.wsp.getHttp<UserReportCustomAttributeFromApi[]>({
      endpoint: this._userReportCustomAttributesEndpoint,
      params: {
        fields,
        filters: [
          {
            key: 'UserReportId',
            type: 'EQ',
            value: [userReportId.toString()]
          }
        ]
      }
    });

    return entities.map(this.formatUserReportCustomAttribute.bind(this));
  }

  async postUserReportCustomAttribute(
    userReportCustomAttribute: UserReportCustomAttribute
  ): Promise<UserReportCustomAttribute> {
    const entity = await this.wsp.postHttp<UserReportCustomAttributeFromApi>({
      endpoint: this._userReportCustomAttributesEndpoint,
      body: this.getUserReportCustomAttributeForServiceRequest(userReportCustomAttribute)
    });

    return this.formatUserReportCustomAttribute(entity);
  }

  async putUserReportCustomAttribute(
    userReportCustomAttribute: UserReportCustomAttribute
  ): Promise<UserReportCustomAttribute> {
    const entity = await this.wsp.putHttp<UserReportCustomAttributeFromApi>({
      endpoint: this._userReportCustomAttributesEndpoint,
      body: this.getUserReportCustomAttributeForServiceRequest(userReportCustomAttribute)
    });

    return this.formatUserReportCustomAttribute(entity);
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
