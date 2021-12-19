import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { AdminIdentifier } from '../../models/security';
import { AdminIdentifierFromApi } from '../../models/security/admin-identifier-from-api.model';

@Injectable()
export class AdminIdentifierService {
  private readonly _adminIdentifiersEndpoint = 'entities/admin_identifiers';

  constructor(private readonly wsp: WebServiceProvider) {}

  deleteIdentifier(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._adminIdentifiersEndpoint}/${id}`
    });
  }

  async getIdentifiers(securityId: number): Promise<AdminIdentifier[]> {
    const fields = [
      'Id',
      'AccountCode',
      'AccountId',
      'AdminCode',
      'AdminId',
      'AdminSecId',
      'EndDate',
      'PnklSecId',
      'StartDate'
    ];
    const identifiers = await this.wsp.getHttp<AdminIdentifierFromApi[]>({
      endpoint: this._adminIdentifiersEndpoint,
      params: {
        fields,
        filters: [
          {
            key: 'PnklSecId',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    });

    return identifiers.map(this.formatIdentifier);
  }

  async getIdentifiersForReconciliation(
    accountId: number,
    adminId: number,
    securityId: number
  ): Promise<AdminIdentifier[]> {
    const identifiers = await this.wsp.getHttp<AdminIdentifierFromApi[]>({
      endpoint: this._adminIdentifiersEndpoint,
      params: {
        fields: ['AdminSecId', 'Id'],
        filters: [
          {
            key: 'AccountId',
            type: 'EQ',
            value: [accountId.toString()]
          },
          {
            key: 'AdminId',
            type: 'EQ',
            value: [adminId.toString()]
          },
          {
            key: 'PnklSecId',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    });

    return identifiers.map(this.formatIdentifier);
  }

  async postIdentifier(entityToSave: AdminIdentifier): Promise<AdminIdentifier> {
    const entity = await this.wsp.postHttp<AdminIdentifierFromApi>({
      endpoint: this._adminIdentifiersEndpoint,
      body: this.getIdentifierForServiceRequest(entityToSave)
    });

    return this.formatIdentifier(entity);
  }

  async putIdentifier(entityToSave: AdminIdentifier): Promise<AdminIdentifier> {
    const entity = await this.wsp.putHttp<AdminIdentifierFromApi>({
      endpoint: this._adminIdentifiersEndpoint,
      body: this.getIdentifierForServiceRequest(entityToSave)
    });

    return this.formatIdentifier(entity);
  }

  private formatIdentifier(
    identifier: AdminIdentifierFromApi
  ): AdminIdentifier {
    const accountId = parseInt(identifier.accountid),
      adminId = parseInt(identifier.adminid),
      endDateMoment = moment(identifier.enddate, 'MM/DD/YYYY'),
      id = parseInt(identifier.id),
      pinnaklSecurityId = parseInt(identifier.pnklsecid),
      startDateMoment = moment(identifier.startdate, 'MM/DD/YYYY');
    return new AdminIdentifier(
      identifier.accountcode,
      !isNaN(accountId) ? accountId : null,
      identifier.admincode,
      !isNaN(adminId) ? adminId : null,
      identifier.adminsecid,
      endDateMoment.isValid() ? endDateMoment.toDate() : null,
      !isNaN(id) ? id : null,
      !isNaN(pinnaklSecurityId) ? pinnaklSecurityId : null,
      startDateMoment.isValid() ? startDateMoment.toDate() : null
    );
  }

  private getIdentifierForServiceRequest(
    adminIdentifier: AdminIdentifier
  ): AdminIdentifierFromApi {
    const identifier = {} as AdminIdentifierFromApi,
      {
        accountId,
        adminId,
        adminSecurityIdentifier,
        endDate,
        id,
        pinnaklSecurityId,
        startDate
      } = adminIdentifier;
    if (accountId !== undefined) {
      identifier.accountid = accountId.toString();
    }
    if (adminId !== undefined) {
      identifier.adminid = adminId.toString();
    }
    if (adminSecurityIdentifier !== undefined) {
      identifier.adminsecid = adminSecurityIdentifier;
    }
    if (endDate !== undefined) {
      identifier.enddate =
        endDate === null ? 'null' : moment(endDate).format('MM/DD/YYYY');
    }
    if (id !== undefined) {
      identifier.id = id.toString();
    }
    if (pinnaklSecurityId !== undefined) {
      identifier.pnklsecid = pinnaklSecurityId.toString();
    }
    if (startDate !== undefined) {
      identifier.startdate =
        startDate === null ? 'null' : moment(startDate).format('MM/DD/YYYY');
    }
    return identifier;
  }
}
