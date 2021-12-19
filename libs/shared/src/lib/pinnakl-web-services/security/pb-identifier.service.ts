import { Injectable } from '@angular/core';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { PbIdentifier } from '../../models/security';
import { PbIdentifierFromApi } from '../../models/security/pb-identifier-from-api.model';

@Injectable()
export class PbIdentifierService {
  private readonly _mappbidEndpoint = 'entities/mappbid';

  constructor(private readonly wsp: WebServiceProvider) { }

  deleteIdentifier(id: number): Promise<void> {
    return this.wsp.deleteHttp({ endpoint: `${this._mappbidEndpoint}/${id}` });
  }

  async getIdentifiers(securityId: number): Promise<PbIdentifier[]> {
    const identifiers = await this.wsp.getHttp<PbIdentifierFromApi[]>({
      endpoint: this._mappbidEndpoint,
      params: {
        fields: ['CustodianId', 'CustodianCode', 'ExtId', 'Id', 'PnklSecId'],
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
    custodianId: number,
    securityId: number
  ): Promise<PbIdentifier[]> {
    const identifiers = await this.wsp.getHttp<PbIdentifierFromApi[]>({
      endpoint: this._mappbidEndpoint,
      params: {
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
    });

    return identifiers.map(this.formatIdentifier);
  }

  async postIdentifier(entityToSave: PbIdentifier): Promise<PbIdentifier> {
    const entity = await this.wsp.postHttp<PbIdentifierFromApi>({
      endpoint: this._mappbidEndpoint,
      body: this.getIdentifierForServiceRequest(entityToSave)
    });

    return this.formatIdentifier(entity);
  }

  async putIdentifier(entityToSave: PbIdentifier): Promise<PbIdentifier> {
    const entity = await this.wsp.putHttp<PbIdentifierFromApi>({
      endpoint: this._mappbidEndpoint,
      body: this.getIdentifierForServiceRequest(entityToSave)
    });

    return this.formatIdentifier(entity);
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
