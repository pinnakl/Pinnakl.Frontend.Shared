import { Injectable } from '@angular/core';

import { GetWebRequest, WebServiceProvider } from '@pnkl-frontend/core';
import { PbIdentifierFromApi } from '../../models/security/pb-identifier-from-api.model';
import { PbIdentifier } from '../../models/security/pb-identifier.model';

@Injectable()
export class PbIdentifierService {
  private readonly RESOURCE_URL = 'mappbid';

  constructor(private wsp: WebServiceProvider) {}

  deleteIdentifier(id: number): Promise<void> {
    return this.wsp.delete({ endPoint: this.RESOURCE_URL, payload: { id } });
  }

  getIdentifiers(securityId: number): Promise<PbIdentifier[]> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: ['CustodianId', 'CustodianCode', 'ExtId', 'Id', 'PnklSecId'],
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
      .then((identifiers: PbIdentifierFromApi[]) =>
        identifiers.map(identifier => this.formatIdentifier(identifier))
      );
  }

  getIdentifiersForReconciliation(
    custodianId: number,
    securityId: number
  ): Promise<PbIdentifier[]> {
    const getWebRequest: GetWebRequest = {
      endPoint: this.RESOURCE_URL,
      options: {
        fields: ['ExtId', 'Id'],
        filters: [
          {
            key: 'CustodianId',
            type: 'EQ',
            value: [custodianId.toString()]
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
      .then((identifiers: PbIdentifierFromApi[]) =>
        identifiers.map(identifier => this.formatIdentifier(identifier))
      );
  }

  postIdentifier(entityToSave: PbIdentifier): Promise<PbIdentifier> {
    let requestBody = this.getIdentifierForServiceRequest(entityToSave);
    return this.wsp
      .post({ endPoint: this.RESOURCE_URL, payload: requestBody })
      .then((entity: PbIdentifierFromApi) => this.formatIdentifier(entity));
  }

  putIdentifier(entityToSave: PbIdentifier): Promise<PbIdentifier> {
    let requestBody = this.getIdentifierForServiceRequest(entityToSave);
    return this.wsp
      .put({ endPoint: this.RESOURCE_URL, payload: requestBody })
      .then((entity: PbIdentifierFromApi) => this.formatIdentifier(entity));
  }

  private formatIdentifier(identifier: PbIdentifierFromApi): PbIdentifier {
    let custodianId = parseInt(identifier.custodianid),
      id = parseInt(identifier.id),
      pinnaklSecurityId = parseInt(identifier.pnklsecid);
    return new PbIdentifier(
      identifier.custodiancode,
      !isNaN(custodianId) ? custodianId : null,
      identifier.extid,
      !isNaN(id) ? id : null,
      !isNaN(pinnaklSecurityId) ? pinnaklSecurityId : null
    );
  }

  private getIdentifierForServiceRequest(
    pbIdentifier: PbIdentifier
  ): PbIdentifierFromApi {
    let identifier = {} as PbIdentifierFromApi,
      { custodianId, externalIdentifier, id, pinnaklSecurityId } = pbIdentifier;
    if (custodianId !== undefined) {
      identifier.custodianid = custodianId.toString();
    }
    if (externalIdentifier !== undefined) {
      identifier.extid = externalIdentifier;
    }
    if (id !== undefined) {
      identifier.id = id.toString();
    }
    if (pinnaklSecurityId !== undefined) {
      identifier.pnklsecid = pinnaklSecurityId.toString();
    }
    return identifier;
  }
}
