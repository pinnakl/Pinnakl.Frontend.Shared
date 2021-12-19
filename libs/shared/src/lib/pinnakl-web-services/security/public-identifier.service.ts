import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { WebServiceProvider } from '@pnkl-frontend/core';
import { PublicIdentifier } from '../../models/security';
import { PublicIdentifierFromApi } from '../../models/security/public-identifier-from-api.model';

@Injectable()
export class PublicIdentifierService {
  private readonly _securityIdentifiersEndpoint =
    'entities/security_identifiers';

  constructor(private readonly wsp: WebServiceProvider) { }

  async deleteIdentifier(id: number): Promise<void> {
    return this.wsp.deleteHttp({
      endpoint: `${this._securityIdentifiersEndpoint}/${id}`
    });
  }

  async getPublicIdentifiers(securityId: number): Promise<PublicIdentifier[]> {
    const fields = [
      'EndDate',
      'Id',
      'Identifier',
      'IdentifierType',
      'MarketId',
      'SecurityId',
      'StartDate'
    ];

    const publicIdentifiers = await this.wsp.getHttp<PublicIdentifierFromApi[]>(
      {
        endpoint: this._securityIdentifiersEndpoint,
        params: {
          fields: fields,
          filters: [
            {
              key: 'securityid',
              type: 'EQ',
              value: [securityId.toString()]
            }
          ]
        }
      }
    );

    return publicIdentifiers.map(publicIdentifier =>
      this.formatIdentifier(publicIdentifier)
    );
  }

  async getPublicIdentifiersByValue(
    identifier: string
  ): Promise<PublicIdentifier[]> {
    const publicIdentifiers = await this.wsp.getHttp<PublicIdentifierFromApi[]>(
      {
        endpoint: this._securityIdentifiersEndpoint,
        params: {
          fields: ['Id', 'SecurityId'],
          filters: [{ key: 'Identifier', type: 'EQ', value: [identifier] }]
        }
      }
    );

    return publicIdentifiers.map(this.formatIdentifier);
  }

  async postIdentifier(entityToSave: PublicIdentifier): Promise<PublicIdentifier> {
    const entity = await this.wsp.postHttp<PublicIdentifierFromApi>({
      endpoint: this._securityIdentifiersEndpoint,
      body: this.getIdentifierForServiceRequest(entityToSave)
    });

    return this.formatIdentifier(entity);
  }

  async putIdentifier(entityToSave: PublicIdentifier): Promise<PublicIdentifier> {
    const entity = await this.wsp.putHttp<PublicIdentifierFromApi>({
      endpoint: this._securityIdentifiersEndpoint,
      body: this.getIdentifierForServiceRequest(entityToSave)
    });

    return this.formatIdentifier(entity);
  }

  private formatIdentifier(
    identifier: PublicIdentifierFromApi
  ): PublicIdentifier {
    const endDateMoment = moment(identifier.enddate, 'MM/DD/YYYY'),
      id = parseInt(identifier.id, 10),
      marketId = parseInt(identifier.marketid, 10),
      securityId = parseInt(identifier.securityid, 10),
      startDateMoment = moment(identifier.startdate, 'MM/DD/YYYY');
    return new PublicIdentifier(
      endDateMoment.isValid() ? endDateMoment.toDate() : null,
      !isNaN(id) ? id : null,
      identifier.identifier,
      identifier.identifiertype,
      !isNaN(marketId) ? marketId : null,
      !isNaN(securityId) ? securityId : null,
      startDateMoment.isValid() ? startDateMoment.toDate() : null
    );
  }

  private getIdentifierForServiceRequest(
    entity: PublicIdentifier
  ): PublicIdentifierFromApi {
    const entityForApi = {} as PublicIdentifierFromApi,
      {
        endDate,
        id,
        identifier,
        identifierType,
        marketId,
        securityId,
        startDate
      } = entity;
    if (endDate !== undefined) {
      entityForApi.enddate =
        endDate !== null ? moment(endDate).format('MM/DD/YYYY') : 'null';
    }
    if (id !== undefined) {
      entityForApi.id = id.toString();
    }
    if (identifier !== undefined) {
      entityForApi.identifier = identifier;
    }
    if (identifierType !== undefined) {
      entityForApi.identifiertype = identifierType;
    }
    if (marketId !== undefined) {
      entityForApi.marketid = marketId !== null ? marketId.toString() : 'null';
    }
    if (securityId !== undefined) {
      entityForApi.securityid = securityId.toString();
    }
    if (startDate !== undefined) {
      entityForApi.startdate =
        startDate !== null ? moment(startDate).format('MM/DD/YYYY') : 'null';
    }
    return entityForApi;
  }
}
