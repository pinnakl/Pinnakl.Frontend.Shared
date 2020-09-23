import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { AdminIdentifierFromApi } from '../../models/security/admin-identifier-from-api.model';
import { AdminIdentifier } from '../../models/security/admin-identifier.model';

@Injectable()
export class AdminIdentifierService {
  private readonly RESOURCE_URL = 'admin_identifiers';

  constructor(private wsp: WebServiceProvider) {}

  deleteIdentifier(id: number): Promise<void> {
    return this.wsp.delete({
      endPoint: this.RESOURCE_URL,
      payload: { id }
    });
  }

  getIdentifiers(securityId: number): Promise<AdminIdentifier[]> {
    const fields = [
      'Id',
      'AccountCode',
      'AccountId',
      'AdminCode',
      'AdminId',
      'AdminSecId',
      'EndDate',
      'PnklSecId',
      'StartDate',
      'TrsIndicator'
    ];
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields,
        filters: [
          {
            key: 'PnklSecId',
            type: 'EQ',
            value: [securityId.toString()]
          }
        ]
      }
    };
    return this.wsp
      .get(getWebRequest)
      .then((identifiers: AdminIdentifierFromApi[]) =>
        identifiers.map(identifier => this.formatIdentifier(identifier))
      );
  }

  getIdentifiersForReconciliation(
    accountId: number,
    adminId: number,
    securityId: number
  ): Promise<AdminIdentifier[]> {
    const fields = ['AdminSecId', 'Id'];
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields,
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
    };
    return this.wsp
      .get(getWebRequest)
      .then((identifiers: AdminIdentifierFromApi[]) =>
        identifiers.map(identifier => this.formatIdentifier(identifier))
      );
  }

  postIdentifier(entityToSave: AdminIdentifier): Promise<AdminIdentifier> {
    let requestBody = this.getIdentifierForServiceRequest(entityToSave);
    return this.wsp
      .post({ endPoint: this.RESOURCE_URL, payload: requestBody })
      .then((entity: AdminIdentifierFromApi) => this.formatIdentifier(entity));
  }

  putIdentifier(entityToSave: AdminIdentifier): Promise<AdminIdentifier> {
    let requestBody = this.getIdentifierForServiceRequest(entityToSave);
    return this.wsp
      .put({ endPoint: this.RESOURCE_URL, payload: requestBody })
      .then((entity: AdminIdentifierFromApi) => this.formatIdentifier(entity));
  }

  private formatIdentifier(
    identifier: AdminIdentifierFromApi
  ): AdminIdentifier {
    let accountId = parseInt(identifier.accountid),
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
      startDateMoment.isValid() ? startDateMoment.toDate() : null,
      identifier.trsindicator === 'True'
    );
  }

  private getIdentifierForServiceRequest(
    adminIdentifier: AdminIdentifier
  ): AdminIdentifierFromApi {
    let identifier = {} as AdminIdentifierFromApi,
      {
        accountId,
        adminId,
        adminSecurityIdentifier,
        endDate,
        id,
        pinnaklSecurityId,
        startDate,
        trsIndicator
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
    if (trsIndicator !== undefined) {
      identifier.trsindicator = trsIndicator ? '1' : '0';
    }
    return identifier;
  }
}
